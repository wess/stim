" Spark Language Support for Neovim
" Author: Spark Team
" License: MIT

if exists('g:loaded_spark') || &cp
  finish
endif
let g:loaded_spark = 1

" Set up filetype detection
augroup spark_filetype
  autocmd!
  autocmd BufRead,BufNewFile *.spark setfiletype spark
augroup END

" Define commands
command! -nargs=0 SparkCompile call spark#compile#current_file()
command! -nargs=0 SparkCompileAndRun call spark#compile#compile_and_run()
command! -nargs=? SparkNewCommand call spark#template#new_command(<q-args>)

" Key mappings
nnoremap <leader>sc :SparkCompile<CR>
nnoremap <leader>sr :SparkCompileAndRun<CR>
nnoremap <leader>sn :SparkNewCommand<CR>

" Set up buffer-local settings for Spark files
augroup spark_buffer_settings
  autocmd!
  autocmd FileType spark setlocal commentstring=//%s
  autocmd FileType spark setlocal shiftwidth=2
  autocmd FileType spark setlocal tabstop=2
  autocmd FileType spark setlocal expandtab
  autocmd FileType spark setlocal autoindent
  autocmd FileType spark setlocal smartindent
augroup END

" Add to statusline
function! SparkStatus()
  if &filetype ==# 'spark'
    return '[Spark]'
  endif
  return ''
endfunction

" Default configuration
if !exists('g:spark_compile_command')
  let g:spark_compile_command = 'bun run dev compile'
endif

if !exists('g:spark_auto_compile')
  let g:spark_auto_compile = 0
endif

if !exists('g:spark_show_errors')
  let g:spark_show_errors = 1
endif

" Auto-compile on save if enabled
if g:spark_auto_compile
  augroup spark_auto_compile
    autocmd!
    autocmd BufWritePost *.spark call spark#compile#current_file()
  augroup END
endif