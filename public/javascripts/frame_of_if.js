function add_observal(id) {
    observe.push(id)
    add_if(id)
}
function add_if(id) {
    add_rule(id, "hiding_rules")
    add_rule(id, "disable_rules")
    
}
