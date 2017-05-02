"use strict";

var Core = require("lapis-core/index.js");
// var Data = require("lazuli-data/index.js");
var SQL = require("lazuli-sql/index.js");
var Access = require("lazuli-access/index.js");
// var Rhino = require("lazuli-rhino/index.js");
var UI = require("lazuli-ui/index.js");


/**
* To efficiently obtain and process the active workflow tasks for a specific
*   page_id/page_key combination
* @param page_id, page_key, callback function called for each task, having arguments:
*   assigned_user, user_name, attributes array
*   due_date, one_time_lock_code, wf_inst_id, wf_inst_node_id, wf_inst_node_title;
*   if the function returns false, the loop is exited
*/
Access.Session.define("getPageTasks", function (page_id, key, callback) {
    var conn = SQL.Connection.getQueryConnection("getPageTasks");
    var resultset;
    var ret;
    var sql = "SELECT SQL_CACHE assigned_user, asgn_user_name, attributes, due_date, " +
        "one_time_lock_code, wf_inst, id, title " +
        "  FROM ac_wf_inst_node " +
        " WHERE status='A' AND page = " + SQL.Connection.escape(page_id) +
        "   AND page_key" + (key ? " = " + SQL.Connection.escape(key) : " IS NULL");

    try {
        resultset = conn.executeQuery(sql);
        while (resultset.next()) {
            ret = callback(
                SQL.Connection.getColumnString(resultset, 1),
                SQL.Connection.getColumnString(resultset, 2),
                SQL.Connection.getColumnString(resultset, 3).split("|"),
                SQL.Connection.getColumnString(resultset, 4),
                SQL.Connection.getColumnString(resultset, 5),
                SQL.Connection.getColumnString(resultset, 6),
                SQL.Connection.getColumnString(resultset, 7),
                SQL.Connection.getColumnString(resultset, 8)
            );
            if (ret === false) {
                break;
            }
        }
    } catch (e) {
        this.report(e);
    } finally {
        conn.finishedWithConnection();
    }
});


/**
* To get the attributes of the first active task found for the given page_id/page_key combination
* @param page_id, page_key
* @return object containing the task's information, if found, or undefined
*/
Access.Session.reassign("getPageTaskInfo", function (page_id, page_key) {
    var out;
    this.getPageTasks(page_id, page_key, function (assigned_user, user_name, attributes,
            due_date, one_time_lock_code, inst_id, node_id, node_title) {
        if (assigned_user) {
            out = {
                assigned_user_id: assigned_user,
                assigned_user_name: Core.Format.convertNameFirstSpaceLast(user_name),
                attributes: attributes,
                due_date: Date.parse(due_date).display(),
                one_time_lock_code: one_time_lock_code,
                wf_inst_id: inst_id,
                wf_inst_node_id: node_id,
                wf_inst_node_title: node_title,
            };
            // break after 1st hit with an assigned user (would there ever be any others?)
            return false;
        }
        return true;
    });
    return out;
});


/*
* To see whether there is a workflow task for the page_id / key combination that is performable
*       by this user, according to the following logic:
* 1. if an active workflow task for this page_id / key is assigned to this user, return true;
* 2. otherwise if an active workflow task for this page_id / key has a one time execution lock
*       code that matches the one for this session
* 3. otherwise if an active workflow task for this page_id / key exists and the access_to_page
*       argument is true, return true;
* 4. otherwise if an active workflow task for this page_id / key has its 'automatic' attribute
*       set, return true;
* 5. otherwise if an active workflow task for this page_id / key is assigned to a user who has
*       delegated to this user, return true;
* 6. if no matching active workflow tasks for this page_id / key combination satisfy the above,
*       return false
* @params page id (string); page key (string) mandatory if page requires a key; access_to_page
*       (boolean) optional, true to apply any active matching workflow task to this user
* @return true if at least one active matching workflow task is relevant for this user, false
*       otherwise
*/
Access.Session.reassign("allowedPageTask", function (page_id, page_key, allowed) {
    var that = this;
    this.getPageTasks(page_id, page_key, function (assigned_user, user_name, attributes,
            due_date, one_time_lock_code, inst_id, node_id, node_title) {
        var text;
        var reason;

        if (assigned_user === that.user_id) {
            reason = "user is task assignee";
            text = "You are performing your assigned task: ";
        }
        if (one_time_lock_code === that.one_time_lock_code && (attributes.indexOf("OT") > -1)) {
            reason = "one-time lock code supplied";
            text = "You are performing this task as a guest: ";
            allowed.one_time_guest_wf_access = true;
        }
        if (allowed.access) {
            reason = "active task exists, user has basic access";
            text = "You are performing general task: ";
        }
        if (attributes.indexOf("AU") > -1) {
            reason = "task is automatic";
        }
        if (that.delegaters && that.delegaters[assigned_user] && (attributes.indexOf("PD") === -1)) {
            reason = "user is delegatee of task assignee";
            text = "You are performing your delegated task: ";
        }
        if (reason) {
            allowed.reason = (allowed.reason ? allowed.reason + ", " : "") + reason;
            allowed.task_found = true;
            if (!allowed.wf_tasks) {
                allowed.wf_tasks = [];
            }
            allowed.wf_tasks.push([
                inst_id,
                node_id,
                (text && (attributes.indexOf("ST") > -1) ? text + node_title : null),
            ]);
        }

        that.debug("allowedPageTask(): " + reason + ", " + text + ", " + attributes);
        return true;            // process all matching tasks
//        return !allowed.task_found;
        // if task_found then no further processing is required
    });
    return allowed.task_found;
});


Access.Session.define("checkCompletedWorkflowTask", function (page_id, page_key, allowed) {
    var conn = SQL.Connection.getQueryConnection("checkCompletedWorkflowTask");
    var resultset;
    try {
        resultset = conn.executeQuery(
            "SELECT U.name, DATE_FORMAT(X.commit_point, '%d/%m/%y'), DATE_FORMAT(X.commit_point, '%H:%i')" +
            "  FROM ac_wf_inst_node N, ac_tx X, ac_user U" +
            " WHERE N.completed_at = X._key AND X.user_id = U._key AND N.status = 'C'" +
            "   AND N.page = " + SQL.Connection.escape(page_id) + " AND N.page_key = " + SQL.Connection.escape(page_key));
        if (resultset.next()) {
            allowed.text += " - Workflow Task was performed by " +
                SQL.Connection.getColumnString(resultset, 1) + " on " +
                SQL.Connection.getColumnString(resultset, 2) + " at " +
                SQL.Connection.getColumnString(resultset, 3);
        }
    } catch (e) {
        this.report(e);
    } finally {
        conn.finishedWithConnection();
    }
});


// to be overridden in wf
Access.Session.defbind("renderTasks", "render", function (spec) {
    var main_elmt = spec.parent_elmt.makeElement("div", "css_hide", "css_payload_tasks");
    var conn = SQL.Connection.getQueryConnection("renderTasks");
    var resultset;
    var iter = {
        elmt_top: main_elmt,
        today: Date.parse("today"),
    };
    var sql =
        "SELECT SQL_CACHE I.page, I.page_key, I.title, S.title, I.due_date, LEFT(I.page, 2) AS module" +
        "  FROM ac_wf_inst_node I" +
        " INNER JOIN ac_wf_inst S ON S._key = I.wf_inst" +
        " WHERE I.status = 'A'" +
        "   AND INSTR(IFNULL(I.attributes, ''), 'ST') > 0" +
        "   AND (I.assigned_user = " + SQL.Connection.escape(this.user_id);

    if (!this.active) {
        return;
    }
    if (this.delegaters_sql_condition) {
        sql += " OR (I.assigned_user IN (" + this.delegaters_sql_condition +
            ") AND (INSTR(IFNULL(I.attributes, ''), 'PD') = 0))";
    }
    sql += " ) ORDER BY I.page, I.due_date";
    this.total_task_count = 0;
    this.overdue_task_count = 0;
    try {
        resultset = conn.executeQuery(sql);
        while (resultset.next()) {
            this.renderTaskRecord(resultset, iter);
        }
        main_elmt.makeElement("div", null, "css_max_display_tasks_header").text(String(this.max_display_tasks_header));
        main_elmt.makeElement("div", null, "css_total_task_count").text(String(this.total_task_count));
        main_elmt.makeElement("div", null, "css_overdue_task_count").text(String(this.overdue_task_count));
    } catch (e) {
        this.report(e);
    } finally {
        conn.finishedWithConnection();
    }
});


Access.Session.define("max_display_tasks_header", 10);

Access.Session.define("renderTaskRecord", function (resultset, iter) {
    var css_class = "css_task media";
    var page_id = SQL.Connection.getColumnString(resultset, 1);
    var page_key = SQL.Connection.getColumnString(resultset, 2);
    var step_title = SQL.Connection.getColumnString(resultset, 3);
    var inst_title = SQL.Connection.getColumnString(resultset, 4);
    var due_date = SQL.Connection.getColumnString(resultset, 5);
    // var module = SQL.Connection.getColumnString(resultset, 6);
    var page = UI.pages.getThrowIfUnrecognized(page_id);
    var anchor_elmt;
    var div_elmt;

    // if (iter.module !== module) {
    //     this.renderTaskModule(iter, module);
    // }
    // if (iter.page_id !== page_id) {
    //     this.renderTaskGroup(iter, page_id, step_title);
    // }
    this.total_task_count += 1;
    if (due_date && due_date < iter.today) {
        this.overdue_task_count += 1;
        css_class += "_overdue";
    }
    if (this.total_task_count > this.max_display_tasks_header) {
        return;
    }
    if (!iter.elmt_task_group) {
        iter.elmt_task_group = iter.elmt_top;
    }
    anchor_elmt = iter.elmt_task_group.makeElement("li", css_class)
        .makeElement("a");
    anchor_elmt.attr("href", page.getSimpleURL(page_key));

    anchor_elmt.makeElement("div", "media-left")
        .makeElement("i", "fa fa-check fa-2x");

    div_elmt = anchor_elmt.makeElement("div", "media-body");
    div_elmt.makeElement("h6", "media-heading").text(step_title);
    div_elmt.makeElement("p").text(inst_title);
});
/*

                            <li class="media">
                                <a href="javascript:;">
                                    <div class="media-left"><img src="assets/img/user-2.jpg" class="media-object" alt="" /></div>
                                    <div class="media-body">
                                        <h6 class="media-heading">Olivia</h6>
                                        <p>Quisque pulvinar tellus sit amet sem scelerisque tincidunt.</p>
                                        <div class="text-muted f-s-11">35 minutes ago</div>
                                    </div>
                                </a>
                            </li>
*/

Access.Session.define("renderTaskModule", function (iter, module) {
    iter.elmt_module = iter.elmt_top.makeElement("div", "css_menu_tasks", module);
    iter.module = module;
});


Access.Session.define("renderTaskGroup", function (iter, page_id, step_title) {
    var li_elmt = iter.elmt_module.makeElement("li", "dropdown");
    var an_elmt = li_elmt.makeElement("a", null, page_id);

    an_elmt.attr("data-toggle", "dropdown");
        // .attr("href", "#")
    // an_elmt.makeElement("i", "fa fa-check fa-2x");
    an_elmt.text(step_title);

    iter.elmt_task_group = li_elmt.makeElement("ul", "dropdown-menu animated fadeInLeft");
    iter.elmt_task_group.attr("aria-labelledby", page_id);


    // iter.elmt_task_group = iter.elmt_module;            // no sub-level
    // iter.elmt_task_group.makeElement("li", "divider").attr("role", "separator");
    // iter.elmt_task_group.makeElement("li", "dropdown-header").text(step_title);

    iter.page_id = page_id;
});

