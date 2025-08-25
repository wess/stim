" Stim Language Support for Neovim
" Author: Stim Team
" License: MIT

if exists('g:loaded_stim') || &cp
  finish
endif
let g:loaded_stim = 1

" Set up filetype detection
augroup stim_filetype
  autocmd!
  autocmd BufRead,BufNewFile *.stim setfiletype stim
augroup END

" Define commands
command! -nargs=0 StimCompile call stim#compile#current_file()
command! -nargs=0 StimCompileAndRun call stim#compile#compile_and_run()
command! -nargs=? StimNewCommand call stim#template#new_command(<q-args>)

" Key mappings
nnoremap <leader>sc :StimCompile<CR>
nnoremap <leader>sr :StimCompileAndRun<CR>
nnoremap <leader>sn :StimNewCommand<CR>

" Set up buffer-local settings for Stim files
augroup stim_buffer_settings
  autocmd!
  autocmd FileType stim setlocal commentstring=//%s
  autocmd FileType stim setlocal shiftwidth=2
  autocmd FileType stim setlocal tabstop=2
  autocmd FileType stim setlocal expandtab
  autocmd FileType stim setlocal autoindent
  autocmd FileType stim setlocal smartindent
augroup END

" Add to statusline
function! StimStatus()
  if &filetype ==# 'stim'
    return '[Stim]'
  endif
  return ''
endfunction

" Default configuration
if !exists('g:stim_compile_command')
  let g:stim_compile_command = './dist/stim compile'
endif

if !exists('g:stim_build_command')
  let g:stim_build_command = 'bun run build'
endif

if !exists('g:stim_auto_compile')
  let g:stim_auto_compile = 0
endif

if !exists('g:stim_show_errors')
  let g:stim_show_errors = 1
endif

" Auto-compile on save if enabled
if g:stim_auto_compile
  augroup stim_auto_compile
    autocmd!
    autocmd BufWritePost *.stim call stim#compile#current_file()
  augroup END
endif