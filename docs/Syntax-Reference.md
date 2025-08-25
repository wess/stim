# Stim Syntax Reference

Complete reference for Stim language syntax and grammar.

## Table of Contents

1. [Lexical Elements](#lexical-elements)
2. [Command Structure](#command-structure)
3. [Variables](#variables)
4. [Data Types](#data-types)
5. [Operators](#operators)
6. [Control Flow](#control-flow)
7. [Function Calls](#function-calls)
8. [Comments](#comments)
9. [Grammar Reference](#grammar-reference)

## Lexical Elements

### Identifiers

Identifiers are used for command names, variable names, and function names.

**Rules:**
- Must start with a letter (a-z, A-Z) or underscore (_)
- Can contain letters, numbers (0-9), and underscores
- Case-sensitive

**Valid identifiers:**
```stim
command_name
myVariable
deploy_to_production
_private
user123
camelCaseVariable
snake_case_variable
```

**Invalid identifiers:**
```stim
123invalid    // Cannot start with number
my-variable   // Hyphen not allowed
my variable   // Space not allowed
if            // Reserved keyword
```

### Keywords

Reserved words that cannot be used as identifiers:

```
command    if         else       for        in         while
ask        confirm    create_file wait_for_response    break
true       false      function   return
```

### Literals

#### String Literals
Strings are enclosed in double or single quotes:

```stim
"double quoted string"
'single quoted string'
"string with \"escaped\" quotes"
'string with \'escaped\' quotes'
""                              // empty string
```

**Escape sequences:**
- `\"` - Double quote
- `\'` - Single quote  
- `\\` - Backslash
- `\n` - Newline (preserved as literal \n)
- `\t` - Tab (preserved as literal \t)

#### Boolean Literals
```stim
true
false
```

#### Array Literals
Arrays are enclosed in square brackets with comma-separated elements:

```stim
[]                              // empty array
["item1"]                       // single element
["item1", "item2", "item3"]     // multiple elements
["mixed", "123", "true"]        // all elements treated as strings
```

### Operators

#### Arithmetic Operators
```stim
+     // Addition/concatenation
```

#### Comparison Operators
```stim
==    // Equality
!=    // Inequality
```

#### Logical Operators
```stim
!     // Logical NOT
&&    // Logical AND
||    // Logical OR
```

### Punctuation
```stim
{     // Open brace
}     // Close brace
[     // Open bracket
]     // Close bracket
(     // Open parenthesis
)     // Close parenthesis
,     // Comma
=     // Assignment
```

## Command Structure

### Command Declaration
```stim
command identifier {
    statement_list
}
```

**Example:**
```stim
command hello_world {
    ask("Hello, world!")
}
```

### Statement List
A command body contains zero or more statements:

```stim
command example {
    // Empty command body - valid
}

command multiple_statements {
    statement1
    statement2
    statement3
}
```

## Variables

### Variable Declaration and Assignment
```stim
identifier = expression
```

**Examples:**
```stim
name = "John"
count = "42"
is_ready = true
items = ["a", "b", "c"]
```

### Variable Reference
Variables are referenced by their identifier:

```stim
ask(name)
ask("Hello " + name)
if (is_ready) { }
for item in items { }
```

## Data Types

### String
Text enclosed in quotes:

```stim
message = "Hello, world!"
empty = ""
multiword = "This is a sentence"
```

### Boolean
True or false values:

```stim
flag = true
disabled = false
```

### Array
Ordered list of elements:

```stim
empty_array = []
strings = ["one", "two", "three"]
mixed = ["text", "123", "true"]  // All treated as strings
```

**Note:** All array elements are currently treated as strings regardless of their literal appearance.

## Operators

### String Concatenation (+)
Joins two strings together:

```stim
full_name = first_name + " " + last_name
message = "Count: " + count
greeting = "Hello, " + name + "!"
```

### Comparison Operators

#### Equality (==)
Tests if two values are equal:

```stim
if (status == "complete") {
    ask("Task finished!")
}
```

#### Inequality (!=)
Tests if two values are not equal:

```stim
if (status != "pending") {
    ask("Status changed")
}
```

### Logical Operators

#### Logical NOT (!)
Negates a boolean value:

```stim
if (!is_complete) {
    ask("Still working...")
}
```

#### Logical AND (&&)
True if both operands are true:

```stim
if (is_ready && has_permission) {
    ask("Proceeding...")
}
```

#### Logical OR (||)
True if either operand is true:

```stim
if (is_admin || is_owner) {
    ask("Access granted")
}
```

### Operator Precedence
From highest to lowest precedence:

1. `!` (logical NOT)
2. `==`, `!=` (comparison)
3. `&&` (logical AND)
4. `||` (logical OR)
5. `+` (concatenation)

Use parentheses to override precedence:

```stim
result = (a + b) == (c + d)
condition = !(is_ready && has_data)
```

## Control Flow

### If Statement
```stim
if (condition) {
    statement_list
}
```

### If-Else Statement
```stim
if (condition) {
    statement_list
} else {
    statement_list
}
```

### For Loop
```stim
for identifier in expression {
    statement_list
}
```

The identifier takes on each value from the array expression.

### While Loop
```stim
while (condition) {
    statement_list
}
```

### Break Statement
```stim
break
```

Exits the innermost loop.

## Function Calls

### Function Call Syntax
```stim
function_name(argument_list)
```

### Built-in Functions

#### ask(question)
```stim
ask(string_expression)
```

#### confirm(message)  
```stim
confirm(string_expression)
```

#### wait_for_response()
```stim
wait_for_response()
```

#### create_file(filename, content)
```stim
create_file(string_expression, string_expression)
```

### Custom Functions
Custom functions are treated as simple function calls:

```stim
git_init()
git_commit("message")
deploy_to_environment(env_name)
```

## Comments

### Single-line Comments
Comments start with `//` and continue to the end of the line:

```stim
// This is a comment
ask("Hello") // Comment after statement
```

### Comment Placement
Comments can appear:
- On their own line
- At the end of a statement line
- Multiple consecutive comment lines

```stim
// File header comment
command example {
    // Variable declarations
    name = "test"
    
    ask("Hello") // Inline comment
    
    // Multi-line comment block
    // explaining complex logic
    // across several lines
}
```

## Grammar Reference

### Complete Grammar (EBNF)

```ebnf
stim_file = command_declaration

command_declaration = "command" IDENTIFIER "{" statement_list "}"

statement_list = { statement }

statement = variable_assignment
          | if_statement  
          | while_statement
          | for_statement
          | break_statement
          | function_call

variable_assignment = IDENTIFIER "=" expression

if_statement = "if" "(" expression ")" "{" statement_list "}"
             | "if" "(" expression ")" "{" statement_list "}" "else" "{" statement_list "}"

while_statement = "while" "(" expression ")" "{" statement_list "}"

for_statement = "for" IDENTIFIER "in" expression "{" statement_list "}"

break_statement = "break"

function_call = IDENTIFIER "(" argument_list ")"

argument_list = [ expression { "," expression } ]

expression = logical_or_expression

logical_or_expression = logical_and_expression { "||" logical_and_expression }

logical_and_expression = equality_expression { "&&" equality_expression }

equality_expression = additive_expression [ ( "==" | "!=" ) additive_expression ]

additive_expression = unary_expression { "+" unary_expression }

unary_expression = [ "!" ] primary_expression

primary_expression = IDENTIFIER
                   | STRING_LITERAL
                   | BOOLEAN_LITERAL
                   | array_literal
                   | "(" expression ")"

array_literal = "[" [ expression { "," expression } ] "]"

IDENTIFIER = LETTER { LETTER | DIGIT | "_" }

STRING_LITERAL = '"' { STRING_CHARACTER | ESCAPE_SEQUENCE } '"'
               | "'" { STRING_CHARACTER | ESCAPE_SEQUENCE } "'"

BOOLEAN_LITERAL = "true" | "false"

LETTER = "a"..."z" | "A"..."Z" | "_"
DIGIT = "0"..."9"
STRING_CHARACTER = any character except '"', "'", or "\"
ESCAPE_SEQUENCE = "\"" | "\'" | "\\"
```

### Statement Types

| Statement Type | Syntax | Example |
|---|---|---|
| Variable Assignment | `var = expr` | `name = "John"` |
| If Statement | `if (cond) { ... }` | `if (ready) { ask("Go!") }` |
| If-Else Statement | `if (cond) { ... } else { ... }` | `if (x) { a() } else { b() }` |
| While Loop | `while (cond) { ... }` | `while (!done) { work() }` |
| For Loop | `for var in arr { ... }` | `for item in items { ask(item) }` |
| Break | `break` | `break` |
| Function Call | `func(args)` | `ask("Hello")` |

### Expression Types

| Expression Type | Syntax | Example |
|---|---|---|
| String Literal | `"text"` or `'text'` | `"Hello, world!"` |
| Boolean Literal | `true` or `false` | `true` |
| Array Literal | `[item, item, ...]` | `["a", "b", "c"]` |
| Variable Reference | `identifier` | `user_name` |
| Concatenation | `expr + expr` | `"Hello " + name` |
| Equality | `expr == expr` | `status == "done"` |
| Inequality | `expr != expr` | `count != "0"` |
| Logical NOT | `!expr` | `!is_ready` |
| Logical AND | `expr && expr` | `ready && loaded` |
| Logical OR | `expr \|\| expr` | `admin \|\| owner` |
| Parenthesized | `(expr)` | `(a + b) == c` |

## Error Messages

### Syntax Errors

Common syntax errors and their meanings:

```
Expected command declaration: command <name> {
→ File must start with command declaration

Invalid assignment: name =  
→ Assignment missing value after =

Invalid ask statement: ask(unclosed string"
→ String literal not properly closed

Invalid function call: func(
→ Function call missing closing parenthesis
```

### Semantic Errors

```
Unknown function: unknown_func
→ Function not recognized (may be valid but not built-in)

Variable not declared: undeclared_var
→ Using variable before assignment (not currently enforced)
```

---

**See also:**
- [API Reference](API.md) - Function documentation
- [Tutorial](Tutorial.md) - Learning guide with examples
- [Examples](Examples.md) - Real-world usage patterns