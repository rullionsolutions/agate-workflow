"use strict";

var Data = require("lazuli-data/index.js");
var text_strings = Data.areas.get("ac").text_strings;


text_strings.wf_digest = {
    text: "{product_name}: Overdue Assigned Tasks - Daily Digest",
    type: "N",
    purpose: "Sent when a user has workflow task(s) past their due date(s), the content being a "
        + "list of the tasks, and links to them",
    trigger: "Daily batch",
    tokens: Data.entities.get("ac_wf_inst_node").workflow_email_tokens,
    detail: "{email_header}\n"
        + "{text_detail}\n"
        + "{email_footer}",
};

text_strings.wf_ntfcn_actvn = {
    text: "{product_name}: You have a new task! - {wf_step_title}",
    type: "N",
    purpose: "Sent when a workflow task becomes active, provided the task is configured for email notification",
    trigger: "A workflow node assigned to this user becomes active",
    tokens: Data.entities.get("ac_wf_inst_node").workflow_email_tokens,
    detail: "{email_header}\n"
        + "You have a workflow task to perform.\n"
        + "{wf_step_title}: {wf_title}\n"
        + "Please complete this step at: {base_uri}{wf_simple_url}\n"
        + "Due: {wf_due_date}\n"
        + "{email_footer}",
};

text_strings.wf_ntfcn_actvn_deleg = {
    text: "{product_name}: You have been delegated a task - {wf_step_title}",
    type: "N",
    purpose: "Sent to a delegate when a workflow task becomes active for the people to whom it is assigned, "
        + "provided the user has chosen to receive delegate notifications",
    trigger: "A workflow node assigned to a delegater of this user becomes active",
    tokens: Data.entities.get("ac_wf_inst_node").workflow_email_tokens,
    detail: "{email_header}\n"
        + "You have been delegated a workflow task to perform.\n"
        + "{wf_step_title}: {wf_title}\n"
        + "Please complete this step at: {base_uri}{wf_simple_url}\n"
        + "Due: {wf_due_date}\n"
        + "{email_footer}",
};
