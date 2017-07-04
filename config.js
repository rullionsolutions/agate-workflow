"use strict";

var SQL = require("lazuli-sql/index.js");
var IO = require("lazuli-io/index.js");
var Rhino = require("lazuli-rhino/index.js");
var UI = require("lazuli-ui/index.js");


Rhino.App.defbind("workflow_loadData", "build", function () {
    // SQL.Connection.loadSQLFile(IO.File.getModulePath(module) + "/wf_inst/build.sql");
    SQL.Connection.shared.loadSQLFile(IO.File.getModulePath(module) + "/wf_inst_node/build.sql");
});


UI.pages.get("home").sections.add({
    id: "tasks",
    type: "HomePageSection",
    title: "Tasks",
    text: "Actions assigned to you that require your attention",
    glyphicon: "icon-ok",
    section_heading_page_id: "ac_wf_tasks",
});
