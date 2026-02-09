; Indent after opening brace
(command_declaration "{" @indent)
(if_statement "{" @indent)
(while_statement "{" @indent)
(for_statement "{" @indent)
(task_statement "{" @indent)
(parallel_statement "{" @indent)

; Dedent at closing brace
"}" @outdent
