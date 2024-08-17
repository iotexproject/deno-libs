import p from 'https://esm.sh/node-sql-parser';

function _stmtCheck(ast: p.AST) {
  if (ast.type !== 'select') {
    return [true, 'only allow select statement'];
  }

  if (ast.from === null) {
    return [true, 'the syntax of from is not supported'];
  }

  return [false, null];
}

export function check(statement: string) {
  if (!statement) {
    return [true, 'statement is empty'];
  }

  if (typeof statement !== 'string') {
    return [true, 'statement is not a string'];
  }

  const parser = new p.Parser();
  let ast = null;
  try {
    ast = parser.astify(statement);
  } catch (error) {
    return [true, error.message];
  }

  // only allow select
  if (Array.isArray(ast)) {
    if (ast.length > 1) {
      return [true, 'only allow one statement'];
    }

    const stmt = ast[0];
    return _stmtCheck(stmt);
  }

  return _stmtCheck(ast);
}
