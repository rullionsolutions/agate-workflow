"use strict";

var Core = require("lapis-core/index.js");
var UI = require("lazuli-ui/index.js");

UI.sections.add(require("agate-workflow/WorkflowNode.js"));
require("agate-workflow/sy_workflow_list.js");
require("agate-workflow/sy_workflow_display.js");

require("agate-workflow/wf_inst/ac_wf_inst.js");
require("agate-workflow/wf_inst/ac_wf_inst_context.js");
require("agate-workflow/wf_inst/ac_wf_inst_display.js");
require("agate-workflow/wf_inst/ac_wf_inst_freeze.js");
require("agate-workflow/wf_inst/ac_wf_inst_search.js");
require("agate-workflow/wf_inst/ac_wf_inst_skip.js");
require("agate-workflow/wf_inst/ac_wf_inst_unfreeze.js");


exports.sections = Core.Collection.clone({
    id: "wf_templates",
    item_type: exports.Section,
});

require("agate-workflow/wf_inst_node/ac_wf_inst_node.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_add.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_auto.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_cleanup_batch.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_context.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_correct.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_display.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_notify.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_notify_batch.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_one_time_exit.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_poke.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_poke_batch.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_search.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_skip.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_timer.js");
require("agate-workflow/wf_inst_node/ac_wf_inst_node_timer_batch.js");

require("agate-workflow/stateful.js");
require("agate-workflow/ac_swf_tmpl_display.js");
require("agate-workflow/ac_swf_inst_display.js");
require("agate-workflow/ac_wf_task_sum.js");
require("agate-workflow/ac_wf_task_sum_list.js");
require("agate-workflow/ac_wf_tasks.js");

require("agate-workflow/email_templates.js");
