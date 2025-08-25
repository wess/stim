" Spark utility functions
" Common utility functions used across the plugin

" Find the project root by looking for package.json
function! stim#util#find_project_root()
  let current_dir = expand('%:p:h')
  
  " Walk up the directory tree looking for package.json
  while current_dir !=# '/'
    if filereadable(current_dir . '/package.json')
      return current_dir
    endif
    let parent_dir = fnamemodify(current_dir, ':h')
    if parent_dir ==# current_dir
      break
    endif
    let current_dir = parent_dir
  endwhile
  
  return ''
endfunction

" Check if current buffer is a Spark file
function! stim#util#is_stim_file()
  return &filetype ==# 'stim' || expand('%:e') ==# 'stim'
endfunction

" Get command name from current file
function! stim#util#get_command_name()
  let filename = expand('%:t:r')
  return filename
endfunction

" Validate Spark command name
function! stim#util#validate_command_name(name)
  return a:name =~ '^[a-zA-Z_][a-zA-Z0-9_]*$'
endfunction

" Get the Claude command path
function! stim#util#get_claude_command_path()
  return expand('~/.claude/commands/')
endfunction

" Check if compiled command exists
function! stim#util#command_exists(command_name)
  let claude_path = stim#util#get_claude_command_path()
  return filereadable(claude_path . a:command_name . '.md')
endfunction

" Format error message
function! stim#util#error(message)
  echohl ErrorMsg
  echo a:message
  echohl None
endfunction

" Format success message  
function! stim#util#success(message)
  echohl MoreMsg
  echo a:message
  echohl None
endfunction

" Format info message
function! stim#util#info(message)
  echo a:message
endfunction

" Get line under cursor
function! stim#util#get_current_line()
  return getline('.')
endfunction

" Get word under cursor
function! stim#util#get_current_word()
  return expand('<cword>')
endfunction

" Check if string is empty or whitespace
function! stim#util#is_blank(str)
  return a:str =~ '^\s*$'
endfunction

" Trim whitespace from string
function! stim#util#trim(str)
  return substitute(a:str, '^\s*\(.\{-}\)\s*$', '\1', '')
endfunction

" Check if Bun is available
function! stim#util#check_bun()
  if !executable('bun')
    call stim#util#error('Bun is not installed or not in PATH')
    return 0
  endif
  return 1
endfunction

" Get Spark version from package.json
function! stim#util#get_stim_version()
  let project_root = stim#util#find_project_root()
  if empty(project_root)
    return 'unknown'
  endif
  
  let package_json = project_root . '/package.json'
  if !filereadable(package_json)
    return 'unknown'
  endif
  
  try
    let content = join(readfile(package_json), '')
    let version_match = matchstr(content, '"version":\s*"\([^"]*\)"')
    if !empty(version_match)
      return substitute(version_match, '"version":\s*"\([^"]*\)"', '\1', '')
    endif
  catch
    " Ignore JSON parsing errors
  endtry
  
  return 'unknown'
endfunction

" Show Spark information
function! stim#util#show_info()
  echo 'Spark Language Support for Neovim'
  echo 'Version: 1.0.0'
  echo 'Spark project version: ' . stim#util#get_stim_version()
  echo 'Project root: ' . stim#util#find_project_root()
  echo 'Bun available: ' . (stim#util#check_bun() ? 'Yes' : 'No')
endfunction