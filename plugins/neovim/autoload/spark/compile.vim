" Spark compilation functions
" Functions for compiling .spark files

" Compile the current file
function! spark#compile#current_file()
  if &filetype !=# 'spark'
    echo 'Not a Spark file'
    return
  endif
  
  let filename = expand('%:p')
  call spark#compile#file(filename)
endfunction

" Compile a specific file
function! spark#compile#file(filename)
  if !filereadable(a:filename)
    echohl ErrorMsg
    echo 'File not found: ' . a:filename
    echohl None
    return
  endif
  
  echo 'Compiling ' . fnamemodify(a:filename, ':t') . '...'
  
  " Find the spark project root
  let project_root = spark#util#find_project_root()
  if empty(project_root)
    echohl ErrorMsg
    echo 'Could not find Spark project root (no package.json found)'
    echohl None
    return
  endif
  
  " Build the compile command
  let cmd = g:spark_compile_command . ' "' . a:filename . '"'
  
  " Execute the command
  let output = system('cd "' . project_root . '" && ' . cmd)
  let exit_code = v:shell_error
  
  if exit_code == 0
    echo '✓ Compilation successful!'
    if !empty(trim(output))
      echo trim(output)
    endif
  else
    echohl ErrorMsg
    echo 'Compilation failed:'
    echo trim(output)
    echohl None
    
    " Show errors in quickfix if enabled
    if g:spark_show_errors
      call spark#compile#show_errors(output)
    endif
  endif
endfunction

" Compile and show run instructions
function! spark#compile#compile_and_run()
  call spark#compile#current_file()
  
  if v:shell_error == 0
    let command_name = expand('%:t:r')
    let run_cmd = '/' . command_name
    
    echo 'Run in Claude Code with: ' . run_cmd
    
    " Copy to clipboard if possible
    if has('clipboard')
      let @+ = run_cmd
      let @* = run_cmd
      echo '(Copied to clipboard)'
    endif
  endif
endfunction

" Parse compilation errors and show in quickfix
function! spark#compile#show_errors(output)
  let errors = []
  let lines = split(a:output, '\n')
  
  for line in lines
    " Parse error format: "Error: message" or "Compilation error: message"
    if line =~ '^.*Error:'
      let error_msg = substitute(line, '^.*Error:\s*', '', '')
      call add(errors, {
        \ 'filename': expand('%:p'),
        \ 'lnum': 1,
        \ 'text': error_msg,
        \ 'type': 'E'
        \ })
    endif
  endfor
  
  if !empty(errors)
    call setqflist(errors)
    copen
  endif
endfunction

" Auto-compile on save
function! spark#compile#setup_auto_compile()
  augroup spark_auto_compile
    autocmd!
    autocmd BufWritePost <buffer> call spark#compile#current_file()
  augroup END
endfunction