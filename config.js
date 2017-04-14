"use strict";

var SQL = require("lazuli-sql/index.js");
var IO = require("lazuli-io/index.js");
var Rhino = require("lazuli-rhino/index.js");


Rhino.App.defbind("workflow_loadData", "build", function () {
    // SQL.Connection.loadSQLFile(IO.File.getModulePath(module) + "/wf_inst/build.sql");
    SQL.Connection.shared.loadSQLFile(IO.File.getModulePath(module) + "/wf_inst_node/build.sql");
});
