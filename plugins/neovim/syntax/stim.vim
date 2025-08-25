" Vim syntax file for Stim DSL
" Language: Stim
" Maintainer: Stim Team
" License: MIT

if exists('b:current_syntax')
  finish
endif

" Keywords
syn keyword stimKeyword command if else while for in break
syn keyword stimBoolean true false
syn keyword stimBuiltinFunction ask confirm wait_for_response create_file
syn keyword stimGitFunction git_init git_commit git_push git_status
syn keyword stimGithubFunction github_create_repo github_create_pr github_create_issue

" String literals
syn region stimString start='"' end='"' contains=stimEscape
syn region stimString start="'" end="'" contains=stimEscape
syn match stimEscape '\\.' contained

" Numbers
syn match stimNumber '\<\d\+\>'

" Comments
syn match stimComment '//.*$' contains=stimTodo
syn keyword stimTodo TODO FIXME NOTE XXX contained

" Operators
syn match stimOperator '[=+]'
syn match stimComparison '=='
syn match stimComparison '!='
syn match stimLogical '&&'
syn match stimLogical '||'
syn match stimLogical '!'

" Identifiers and function calls
syn match stimIdentifier '\<[a-zA-Z_][a-zA-Z0-9_]*\>'
syn match stimFunction '\<[a-zA-Z_][a-zA-Z0-9_]*\>\ze\s*('

" Arrays
syn region stimArray start='\[' end='\]' contains=stimString,stimNumber,stimBoolean,stimIdentifier

" Command blocks
syn region stimCommandBlock start='{' end='}' fold transparent contains=ALL

" Command declarations
syn match stimCommandDecl '\<command\s\+\w\+' contains=stimKeyword

" Brackets and braces
syn match stimBrackets '[(){}\[\]]'

" Define highlighting groups
hi def link stimKeyword Keyword
hi def link stimBoolean Boolean
hi def link stimBuiltinFunction Function
hi def link stimGitFunction Function
hi def link stimGithubFunction Function
hi def link stimString String
hi def link stimEscape SpecialChar
hi def link stimNumber Number
hi def link stimComment Comment
hi def link stimTodo Todo
hi def link stimOperator Operator
hi def link stimComparison Operator
hi def link stimLogical Operator
hi def link stimIdentifier Identifier
hi def link stimFunction Function
hi def link stimArray Type
hi def link stimBrackets Delimiter
hi def link stimCommandDecl PreProc

let b:current_syntax = 'stim'

" Folding
syn region stimFold start='{' end='}' transparent fold
setlocal foldmethod=syntax
setlocal foldlevelstart=1