" Spark template functions
" Functions for creating new Spark commands and snippets

" Create a new command template
function! spark#template#new_command(...)
  let command_name = ''
  
  " Get command name from argument or prompt
  if a:0 > 0 && !empty(a:1)
    let command_name = a:1
  else
    let command_name = input('Command name: ', '', 'file')
  endif
  
  if empty(command_name)
    echo 'Cancelled'
    return
  endif
  
  " Validate command name
  if command_name !~ '^[a-zA-Z_][a-zA-Z0-9_]*$'
    echohl ErrorMsg
    echo 'Invalid command name. Must be a valid identifier.'
    echohl None
    return
  endif
  
  " Generate template
  let template = spark#template#basic_command(command_name)
  
  " Create new buffer with template
  enew
  setfiletype spark
  call setline(1, split(template, '\n'))
  
  " Position cursor at first edit point
  call search('What would you like to do?', 'w')
  
  echo 'New Spark command "' . command_name . '" created!'
endfunction

" Generate basic command template
function! spark#template#basic_command(name)
  return 'command ' . a:name . ' {' . "\n"
        \ . '  ask("What would you like to do?")' . "\n"
        \ . '  wait_for_response()' . "\n"
        \ . '  ' . "\n"
        \ . '  if (confirm("Continue with this action?")) {' . "\n"
        \ . '    ask("Great! Let''s proceed.")' . "\n"
        \ . '  }' . "\n"
        \ . '  ' . "\n"
        \ . '  // Add your command logic here' . "\n"
        \ . '}'
endfunction

" Generate interactive survey template
function! spark#template#survey()
  return 'questions = [' . "\n"
        \ . '  "Question 1?",'. "\n"
        \ . '  "Question 2?",'. "\n"
        \ . '  "Question 3?"'. "\n"
        \ . ']' . "\n"
        \ . '' . "\n"
        \ . 'for question in questions {' . "\n"
        \ . '  ask(question)' . "\n"
        \ . '  wait_for_response()' . "\n"
        \ . '}' . "\n"
        \ . '' . "\n"
        \ . 'ask("Thank you for your responses!")'
endfunction

" Generate feature selection template
function! spark#template#feature_selection()
  return 'features = ["Feature 1", "Feature 2", "Feature 3"]' . "\n"
        \ . '' . "\n"
        \ . 'for feature in features {' . "\n"
        \ . '  if (confirm("Do you need " + feature + "?")) {' . "\n"
        \ . '    ask("Great! " + feature + " will be included.")' . "\n"
        \ . '  }' . "\n"
        \ . '}'
endfunction

" Generate git workflow template
function! spark#template#git_workflow()
  return 'if (confirm("Initialize git repository?")) {' . "\n"
        \ . '  git_init()' . "\n"
        \ . '  git_commit("Initial commit")' . "\n"
        \ . '  ask("Git repository initialized!")' . "\n"
        \ . '}'
endfunction

" Insert template at cursor position
function! spark#template#insert_at_cursor(template_func)
  let template = call(a:template_func, [])
  let lines = split(template, '\n')
  call append(line('.'), lines)
endfunction

" Template insertion commands
function! spark#template#insert_survey()
  call spark#template#insert_at_cursor('spark#template#survey')
endfunction

function! spark#template#insert_features()
  call spark#template#insert_at_cursor('spark#template#feature_selection')
endfunction

function! spark#template#insert_git()
  call spark#template#insert_at_cursor('spark#template#git_workflow')
endfunction