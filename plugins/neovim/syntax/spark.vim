" Vim syntax file for Spark DSL
" Language: Spark
" Maintainer: Spark Team
" License: MIT

if exists('b:current_syntax')
  finish
endif

" Keywords
syn keyword sparkKeyword command if else while for in break
syn keyword sparkBoolean true false
syn keyword sparkBuiltinFunction ask confirm wait_for_response create_file
syn keyword sparkGitFunction git_init git_commit git_push git_status
syn keyword sparkGithubFunction github_create_repo github_create_pr github_create_issue

" String literals
syn region sparkString start='"' end='"' contains=sparkEscape
syn region sparkString start="'" end="'" contains=sparkEscape
syn match sparkEscape '\\.' contained

" Numbers
syn match sparkNumber '\<\d\+\>'

" Comments
syn match sparkComment '//.*$' contains=sparkTodo
syn keyword sparkTodo TODO FIXME NOTE XXX contained

" Operators
syn match sparkOperator '[=+]'
syn match sparkComparison '=='
syn match sparkComparison '!='
syn match sparkLogical '&&'
syn match sparkLogical '||'
syn match sparkLogical '!'

" Identifiers and function calls
syn match sparkIdentifier '\<[a-zA-Z_][a-zA-Z0-9_]*\>'
syn match sparkFunction '\<[a-zA-Z_][a-zA-Z0-9_]*\>\ze\s*('

" Arrays
syn region sparkArray start='\[' end='\]' contains=sparkString,sparkNumber,sparkBoolean,sparkIdentifier

" Command blocks
syn region sparkCommandBlock start='{' end='}' fold transparent contains=ALL

" Command declarations
syn match sparkCommandDecl '\<command\s\+\w\+' contains=sparkKeyword

" Brackets and braces
syn match sparkBrackets '[(){}\[\]]'

" Define highlighting groups
hi def link sparkKeyword Keyword
hi def link sparkBoolean Boolean
hi def link sparkBuiltinFunction Function
hi def link sparkGitFunction Function
hi def link sparkGithubFunction Function
hi def link sparkString String
hi def link sparkEscape SpecialChar
hi def link sparkNumber Number
hi def link sparkComment Comment
hi def link sparkTodo Todo
hi def link sparkOperator Operator
hi def link sparkComparison Operator
hi def link sparkLogical Operator
hi def link sparkIdentifier Identifier
hi def link sparkFunction Function
hi def link sparkArray Type
hi def link sparkBrackets Delimiter
hi def link sparkCommandDecl PreProc

let b:current_syntax = 'spark'

" Folding
syn region sparkFold start='{' end='}' transparent fold
setlocal foldmethod=syntax
setlocal foldlevelstart=1