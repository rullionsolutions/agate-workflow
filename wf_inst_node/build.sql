
INSERT INTO sy_list (_key, _tx, area, id, title) VALUES
    ('ac.node_ntfcn_status', null, 'ac', 'node_ntfcn_status', 'Workflow Instance Node Notification Status'),
    ('ac.node_status', null, 'ac', 'node_status', 'Workflow Instance Node Status'),
    ('sy.node_attributes', null, 'sy', 'node_attributes', 'Node Attributes');
    -- ('sy.wf_ntfcn_lvl', null, 'sy', 'wf_ntfcn_lvl', 'Workflow Notification Level'),


INSERT INTO sy_list_item (_key, _tx, seq_number, list, id, text, active, from_value, to_value) VALUES
    ('ac.node_ntfcn_status.AU', null,  '5', 'ac.node_ntfcn_status', 'AU', 'Activation Notification to send', 'A', null, null),
    ('ac.node_ntfcn_status.AS', null, '10', 'ac.node_ntfcn_status', 'AS', 'Activation Notification is sent', 'A', null, null),
    ('ac.node_ntfcn_status.RU', null, '15', 'ac.node_ntfcn_status', 'RU', 'Reminder Notification to send', 'A', null, null),
    ('ac.node_ntfcn_status.RS', null, '20', 'ac.node_ntfcn_status', 'RS', 'Reminder Notification is sent', 'A', null, null),
    ('ac.node_ntfcn_status.DU', null, '25', 'ac.node_ntfcn_status', 'DU', 'Due Notification to send', 'A', null, null),
    ('ac.node_ntfcn_status.DS', null, '30', 'ac.node_ntfcn_status', 'DS', 'Due Notification is sent', 'A', null, null),
    ('ac.node_status.A', null, '10', 'ac.node_status', 'A', 'active', 'A', null, null),
    ('ac.node_status.C', null, '20', 'ac.node_status', 'C', 'completed', 'A', null, null),
    ('ac.node_status.F', null, '35', 'ac.node_status', 'F', 'frozen', 'A', null, null),
    ('ac.node_status.K', null, '25', 'ac.node_status', 'K', 'skipped', 'A', null, null),
    ('ac.node_status.P', null,  '5', 'ac.node_status', 'P', 'pending', 'A', null, null),
    ('sy.node_attributes.ST', null, '10', 'sy.node_attributes', 'ST', 'show in taskbar', 'A', null, null),
    ('sy.node_attributes.AU', null, '20', 'sy.node_attributes', 'AU', 'automatic', 'A', null, null),
    ('sy.node_attributes.SU', null, '30', 'sy.node_attributes', 'SU', 'skip if no assigned user on activation', 'A', null, null),
    ('sy.node_attributes.OA', null, '40', 'sy.node_attributes', 'OA', 'override actor', 'A', null, null),
    ('sy.node_attributes.PD', null, '50', 'sy.node_attributes', 'PD', 'prevent delegation', 'A', null, null),
    ('sy.node_attributes.SN', null, '60', 'sy.node_attributes', 'SN', 'skip notification', 'A', null, null),
    ('sy.node_attributes.SM', null, '70', 'sy.node_attributes', 'SM', 'suppress activation message', 'A', null, null),
    ('sy.node_attributes.OT', null, '80', 'sy.node_attributes', 'OT', 'one time link execution', 'A', null, null),
    ('sy.node_attributes.SP', null, '90', 'sy.node_attributes', 'SP', 'separate process', 'A', null, null);
    -- ('sy.wf_ntfcn_lvl.H', null, '20', 'sy.wf_ntfcn_lvl', 'H', 'high', 'A', null, null),
    -- ('sy.wf_ntfcn_lvl.L', null, '40', 'sy.wf_ntfcn_lvl', 'L', 'low', 'A', null, null),
    -- ('sy.wf_ntfcn_lvl.M', null, '30', 'sy.wf_ntfcn_lvl', 'M', 'medium', 'A', null, null),
    -- ('sy.wf_ntfcn_lvl.N', null, '50', 'sy.wf_ntfcn_lvl', 'N', 'none', 'A', null, null),
    -- ('sy.wf_ntfcn_lvl.V', null, '10', 'sy.wf_ntfcn_lvl', 'V', 'very high', 'A', null, null),
