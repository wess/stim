/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "stim",

  extras: ($) => [/\s/, $.comment],

  rules: {
    source_file: ($) => $.command_declaration,

    command_declaration: ($) =>
      seq("command", field("name", $.identifier), "{", optional($.statement_list), "}"),

    statement_list: ($) => repeat1($._statement),

    _statement: ($) =>
      choice(
        $.variable_assignment,
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.break_statement,
        $.task_statement,
        $.task_file_statement,
        $.parallel_statement,
        $.function_call,
      ),

    variable_assignment: ($) =>
      seq(field("name", $.identifier), "=", field("value", $._expression)),

    if_statement: ($) =>
      seq(
        "if",
        "(",
        field("condition", $._expression),
        ")",
        "{",
        optional($.statement_list),
        "}",
        optional(seq("else", "{", optional($.statement_list), "}")),
      ),

    while_statement: ($) =>
      seq("while", "(", field("condition", $._expression), ")", "{", optional($.statement_list), "}"),

    for_statement: ($) =>
      seq(
        "for",
        field("variable", $.identifier),
        "in",
        field("iterable", $._expression),
        "{",
        optional($.statement_list),
        "}",
      ),

    break_statement: ($) => "break",

    task_statement: ($) =>
      seq(
        "task",
        optional(field("agent", $.agent_type)),
        field("description", $.string),
        "{",
        optional($.statement_list),
        "}",
      ),

    task_file_statement: ($) =>
      seq(
        "task",
        "(",
        field("file", $.string),
        optional(seq(",", field("agent", $.agent_type))),
        ")",
      ),

    parallel_statement: ($) =>
      seq("parallel", "{", repeat(choice($.task_statement, $.task_file_statement)), "}"),

    agent_type: ($) => choice("bash", "explore", "plan", "general"),

    function_call: ($) =>
      seq(field("name", $.identifier), "(", optional($.argument_list), ")"),

    argument_list: ($) => seq($._expression, repeat(seq(",", $._expression))),

    _expression: ($) =>
      choice(
        $.string,
        $.boolean,
        $.number,
        $.array,
        $.identifier,
        $.binary_expression,
        $.unary_expression,
        $.parenthesized_expression,
      ),

    binary_expression: ($) =>
      choice(
        prec.left(1, seq($._expression, "||", $._expression)),
        prec.left(2, seq($._expression, "&&", $._expression)),
        prec.left(3, seq($._expression, choice("==", "!="), $._expression)),
        prec.left(4, seq($._expression, "+", $._expression)),
      ),

    unary_expression: ($) => prec(5, seq("!", $._expression)),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    array: ($) => seq("[", optional(seq($._expression, repeat(seq(",", $._expression)))), "]"),

    string: ($) =>
      choice(
        seq('"', repeat(choice($.escape_sequence, /[^"\\]+/)), '"'),
        seq("'", repeat(choice($.escape_sequence, /[^'\\]+/)), "'"),
      ),

    escape_sequence: ($) => /\\./,

    boolean: ($) => choice("true", "false"),

    number: ($) => /\d+/,

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    comment: ($) => seq("//", /.*/),
  },
});
