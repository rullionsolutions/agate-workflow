"use strict";

var Core = require("lapis-core/index.js");
var UI = require("lazuli-ui/index.js");


module.exports = UI.pages.get("ac_wf_inst_node_auto").clone({
    id              : "ac_wf_inst_node_notify",
    title           : "Send Ad-hoc Email Notification"
});


module.exports.defbind("setupEnd", "setupEnd", function () {
    var that = this,
        spec = {},
        email_id,
        wf_inst_node,
        i;

    function send(recipient) {
        var inner_spec = {};
        Core.Base.addProperties.call(inner_spec, spec);            // copy spec properties to inner_spec
        if (recipient.actor) {
            recipient.user = wf_inst_node.wf_inst.actors.get(recipient.actor).getUserId(wf_inst_node);
        }
        inner_spec.to_user = recipient.user;
        inner_spec.to_addr = recipient.email;
        if (typeof recipient.include_delegates === "boolean") {
            inner_spec.include_delegates = recipient.include_delegates;
        }
        if (inner_spec.to_user || inner_spec.to_addr) {         // send email if user_id and/or email address is specified
            email_id = that.addEmail(inner_spec).id;
        }
    }

    if (!this.performing_wf_nodes || this.performing_wf_nodes.length === 0) {
        this.throwError({ id: "no_wf_node_detected" });
    }
    spec.text_string = this.email_text_string;
    wf_inst_node = this.performing_wf_nodes[0];
    wf_inst_node.setParameters(wf_inst_node, spec);
    if (!spec.text_string) {
        this.throwError({ id: "no_email_text_string" });
    }
    if (this.performing_wf_nodes.length < 1) {
        this.throwError({ id: "no_performing_wf_nodes" });
    }

    if (spec.skip_send) {
        return;
    }

    if (this.recipient && typeof this.recipient.length === "number") {
        for (i = 0; i < this.recipient.length; i += 1) {
            send(this.recipient[i]);
        }
    } else if (this.recipient) {
        send(this.recipient);
    } else if (this.recipient_actor) {      // backward compat
        send({ actor: this.recipient_actor });
    }
    if (email_id) {
        wf_inst_node.getField("ntfcn_email").set(email_id);
    } else if (!wf_inst_node.getField("attributes").isItem("SU")) {
        this.throwError({ id: "no_email_sent",
            recipient_actor: this.recipient_actor, recipient_user: this.recipient_user, recipient_email: this.recipient_email });
    }
});
