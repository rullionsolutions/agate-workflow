"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_tasks",
    entity_id       : "ac_wf_inst_node",
    title           : "Your Tasks",
    description     : "Tasks that are or were assigned to you",
    glyphicon       : "icon-ok",
    security        : { all: true }
});


module.exports.tabs.addAll([
    { id: "curr", label: "Current Tasks"  , description: "Tasks currently assigned (or delegated) to you" },
    { id: "cmpl", label: "Completed Tasks", description: "Tasks completed by you (or assigned to you and completed by someone else)" }
]);


module.exports.sections.addAll([
    { id: "filter", type: "Section", text: "", label: "" },
    { id: "main"  , type: "ListQuery", tab: "curr", entity: "ac_wf_inst_node", title: "Tasks Assigned to you"  },
    { id: "deleg" , type: "ListQuery", tab: "curr", entity: "ac_wf_inst_node", title: "Tasks Delegated to you" },
    { id: "cmpltd", type: "ListQuery", tab: "cmpl", entity: "ac_wf_inst_node", title: "Completed Tasks" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    function setupSection(section) {
        section.query.addCondition({ full_condition: "INSTR(A.attributes, 'ST') > 0" });
        section.query.getColumn("A.title").sortTop();
        section.level_break_depth = 1;
        section.row_control_col.visible = false;
        section.hide_break_ends   = true;
        section.columns.moveTo("title", 1);
        section.columns.get("title"        ).label   = "";      // avoid outputting "Title" in the break-start rows
        section.columns.get("wf_inst"      ).label   = "Task";  // avoid printing "Workflow Instance" in the column heading
        section.columns.get("id"           ).visible = false;
        section.columns.get("status"       ).visible = false;
        section.columns.get("assigned_user").visible = false;
        section.columns.get("simple_url"   ).visible = false;
        section.columns.get("rmdr_date"    ).visible = true;
        section.columns.get( "due_date"    ).visible = true;
        section.rowURL = function (row_elem, row_obj) {
//            var url = row_obj.getField("simple_url").get();
            var url = "index.html?page_id=" + row_obj.getField("page").get() + "&page_key=" + row_obj.getField("page_key").get();
            if (section.owner.page.session.allowedURL(url)) {
                row_elem.attribute("url", url);
            }
        };
    }

    this.sections.get("main"  ).query.addCondition({ column: "A.assigned_user", operator: "=", value: this.session.user_id });
    this.sections.get("main"  ).query.addCondition({ column: "A.status"       , operator: "=", value: "A" });
    setupSection(this.sections.get("main"  ));

    this.sections.get("deleg" ).query.addCondition({
        full_condition: "A.assigned_user IN ( select ZZ.delegater from ac_user_deleg ZZ where ZZ.delegatee='" +
            this.session.user_id + "' )",
        });
    this.sections.get("deleg" ).query.addCondition({
        column: "A.status",
        operator: "=",
        value: "A",
    });
    setupSection(this.sections.get("deleg" ));
    this.sections.get("deleg" ).columns.get("assigned_user").visible = true;

    this.sections.get("cmpltd").query.addCondition({ column: "A.assigned_user", operator: "=", value: this.session.user_id });
    this.sections.get("cmpltd").query.addCondition({ full_condition: "A.status IN ('C', 'K', 'X' )" });
    setupSection(this.sections.get("cmpltd"));
    this.sections.get("cmpltd").columns.get("rmdr_date"    ).visible = false;
    this.sections.get("cmpltd").columns.get( "due_date"    ).visible = false;
    this.sections.get("cmpltd").columns.get("completed_at" ).visible = true;
    this.sections.get("cmpltd").columns.get("completed_by" ).visible = true;
});


module.exports.defbind("updateTaskPageCond", "updateBeforeSections", function (params) {
    var has_page,
        new_view    = false;

    if (this.task_page && params.page_button === "reset_filter") {
        new_view = true;
        this.sections.get("filter").text = "";
        delete this.task_page;
    }
    if (params && params.task_page && UI.pages.get(params.task_page)) {
        if (!this.task_page || (this.task_page && this.task_page !== params.task_page)) {
            new_view = true;
        }
        this.task_page = params.task_page;
        this.sections.get("filter").text = "Task lists are filtered using task_page = " + UI.pages.get(params.task_page).title
                                         + "≤br≥≤br≥≤button id='reset_filter' class='css_cmd btn btn-primary css_button_main'≥Reset filter≤/button≥";
    }
    // If coming to this page anew i.e. from Your Tasks or a task menu show Current Tasks
    if (new_view) {
        this.moveToTab("curr");
        this.sections.get("main"  ).recordset = 1;
        this.sections.get("deleg" ).recordset = 1;
        this.sections.get("cmpltd").recordset = 1;
    }

    has_page = (this.task_page !== undefined);

    function updateTaskPageCond(sctn, page_id) {
        if (sctn.task_page_cond) {
            sctn.task_page_cond.remove();
            delete sctn.task_page_cond;
        }
        if (page_id) {
            sctn.task_page_cond = sctn.query.addCondition({
                column:"A.page",
                operator: "=",
                value: page_id,
            });
        }
    }

    this.full_title = has_page ? "Your '" + UI.pages.get(this.task_page).title + "' Tasks" : "Your Tasks";

    updateTaskPageCond(this.sections.get("main"  ), this.task_page);
    updateTaskPageCond(this.sections.get("deleg" ), this.task_page);
    updateTaskPageCond(this.sections.get("cmpltd"), this.task_page);
});
