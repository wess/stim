" Spark filetype plugin
" Only load once per buffer
if exists('b:did_ftplugin')
  finish
endif
let b:did_ftplugin = 1

" Save compatibility options
let s:save_cpo = &cpo
set cpo&vim

" Buffer-local settings
setlocal commentstring=//%s
setlocal comments=://
setlocal shiftwidth=2
setlocal tabstop=2  
setlocal expandtab
setlocal autoindent
setlocal smartindent
setlocal textwidth=100

" Folding
setlocal foldmethod=indent
setlocal foldlevelstart=1

" Indentation
setlocal indentexpr=SparkIndent()
setlocal indentkeys+=0},0{,o,O

" Matchpairs for % jumping
setlocal matchpairs+=<:>

" Buffer-local key mappings
nnoremap <buffer> <leader>sc :SparkCompile<CR>
nnoremap <buffer> <leader>sr :SparkCompileAndRun<CR>
nnoremap <buffer> <leader>sn :SparkNewCommand<CR>

" Text objects for command blocks
vnoremap <buffer> ic :<C-u>call <SID>SelectCommandBlock('i')<CR>
vnoremap <buffer> ac :<C-u>call <SID>SelectCommandBlock('a')<CR>
onoremap <buffer> ic :<C-u>call <SID>SelectCommandBlock('i')<CR>
onoremap <buffer> ac :<C-u>call <SID>SelectCommandBlock('a')<CR>

" Spark-specific abbreviations
iabbrev <buffer> cmd command
iabbrev <buffer> conf confirm
iabbrev <buffer> resp wait_for_response()

" Function to handle Spark indentation
function! SparkIndent()
  let lnum = prevnonblank(v:lnum - 1)
  if lnum == 0
    return 0
  endif
  
  let line = getline(lnum)
  let cline = getline(v:lnum)
  let ind = indent(lnum)
  
  " Increase indent after opening braces
  if line =~ '{\s*$'
    let ind += &shiftwidth
  endif
  
  " Decrease indent for closing braces
  if cline =~ '^\s*}'
    let ind -= &shiftwidth
  endif
  
  return ind
endfunction

" Text object function for command blocks
function! s:SelectCommandBlock(mode)
  " Find the start of the command block
  let start_line = search('command\s\+\w\+\s*{', 'bnW')
  if start_line == 0
    return
  endif
  
  " Find the matching closing brace
  call cursor(start_line, 1)
  normal! f{%
  let end_line = line('.')
  
  if a:mode ==# 'i'
    " Inner: exclude the command line and braces
    call cursor(start_line + 1, 1)
    normal! V
    call cursor(end_line - 1, 1)
  else
    " Around: include everything
    call cursor(start_line, 1)
    normal! V
    call cursor(end_line, 1)
  endif
  normal! o
endfunction

" Completion function for Spark keywords and functions
function! SparkComplete(findstart, base)
  if a:findstart
    " Find the start of the word
    let line = getline('.')
    let start = col('.') - 1
    while start > 0 && line[start - 1] =~ '\w'
      let start -= 1
    endwhile
    return start
  else
    " Return completion matches
    let completions = []
    
    " Keywords
    let keywords = ['command', 'if', 'else', 'while', 'for', 'in', 'break', 'true', 'false']
    
    " Built-in functions
    let functions = ['ask', 'confirm', 'wait_for_response', 'create_file', 'git_init', 'git_commit', 'git_push', 'github_create_repo']
    
    " Filter based on input
    for word in keywords + functions
      if word =~ '^' . a:base
        call add(completions, word)
      endif
    endfor
    
    return completions
  endif
endfunction

" Set completion function
setlocal completefunc=SparkComplete

" Restore compatibility options
let &cpo = s:save_cpo
unlet s:save_cpo