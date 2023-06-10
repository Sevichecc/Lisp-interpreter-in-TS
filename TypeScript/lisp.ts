// Lispts: Scheme Interpreter in TypeScript
const program = "(begin (define r 10) (* pi (* r r)))"

type LSymbol = string // A Lisp Symbol(alias TSymbol) is implemented as TypeScript string
type LNumber = number // A Lisp Symbol(alias TSymbol) is implemented as TypeScript number
type Atom = LSymbol | number // A Lisp Atom is a Symbol or Number impl
type List = Array<any> // A Lisp List is implemented as a TypeScript array
type Exp = Atom | List // A Lisp expression is an Atom or List
interface Env {
  [key: string | number]: any
} // A Lisp environment is a mapping of {variable: value}

/**
 * Read a Scheme expression from a string.
 */
const parse = (program: string): Exp => read_from_tokens(tokenize(program))

/**
 * Convert a string into a list of tokens.
 */
const tokenize = (char: string): string[] =>
  char
    .replaceAll('(', ' ( ')
    .replaceAll(')', ' ) ')
    .split(' ')
    .filter((s) => s)

/**
 * Numbers become numbers; every other token is a symbol(LSymbol).
 */
const atom = (token: string): Atom =>
  Number.isNaN(token) ? Number(token) : (token as LSymbol)

/**
 * Read an expression from a sequence of tokens
 */
const read_from_tokens = (tokens: string[]): Exp => {
  if (tokens.length === 0 || !tokens) {
    throw new Error('unexpected EOF while reading')
  }
  const token = tokens.shift()
  if (token === '(') {
    const l = []
    while (tokens[0] !== ')') {
      l.push(read_from_tokens(tokens))
    }
    tokens.shift()
    return l
  } else if (token === ')') {
    throw new Error('unexpected )')
  } else {
    return atom(token as string)
  }
}

console.log(parse(program))
