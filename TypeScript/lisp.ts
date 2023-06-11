// Lispts: Scheme Interpreter in TypeScript

const program = '(begin (define r 10) (* pi (* r r)))'

//--------- types ------------
type LSymbolType = string // A Lisp Symbol is implemented as TypeScript string
type LNumber = number // A Lisp Number is implemented as TypeScript number
type Atom = LSymbolType | number // A Lisp Atom is a Symbol or Number impl
type List = Array<any> // A Lisp List is implemented as a TypeScript array
type Exp = Atom | List // A Lisp expression is an Atom or List
type Env = Map<string, any>

//---------- utils -------------
class LSymbol {
  readonly value: string

  constructor(value: string) {
    this.value = value
  }

  toString(): string {
    return this.value
  }
}

const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  )
    return false

  const keyA = Object.keys(a)
  const keyB = Object.keys(b)

  if (keyA.length !== keyB.length) return false

  for (const key of keyA) {
    if (!keyB.includes(key) || !deepEqual(a[key], b[key])) return false
  }

  return true
}

//---------- Parsing: parse, tokenize, and read_from_tokens ----------------
/**
 * Read a Scheme expression from a string.
 */
const parse = (program: string): Exp => readFromTokens(tokenize(program))

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
  isNaN(Number(token)) ? (token as LSymbolType) : Number(token)

/**
 * Read an expression from a sequence of tokens
 */
const readFromTokens = (tokens: string[]): Exp => {
  if (tokens.length === 0) {
    throw new Error('unexpected EOF while reading')
  }
  const token = tokens.shift()
  if (token === '(') {
    const l = []
    while (tokens[0] !== ')') {
      l.push(readFromTokens(tokens))
    }
    tokens.shift()
    return l
  } else if (token === ')') {
    throw new Error('unexpected )')
  } else {
    return atom(token as string)
  }
}

// ---------------- Environments ------------------
/**
 * An environment with some Scheme standard procedures
 */
const standardEnv = (): Env => {
  let env: Env = new Map()
  env.set('+', (a: number, b: number) => a + b)
  env.set('-', (a: number, b: number) => a - b)
  env.set('*', (a: number, b: number) => a * b)
  env.set('/', (a: number, b: number) => a / b)
  env.set('>', (a: number, b: number) => a > b)
  env.set('<', (a: number, b: number) => a < b)
  env.set('>=', (a: number, b: number) => a >= b)
  env.set('<=', (a: number, b: number) => a <= b)
  env.set('=', (a: number, b: number) => a === b)
  env.set('append', (a: any[], b: any[]) => a.concat(b))
  env.set('apply', (proc: Function, args: any[]) => proc(...args))
  env.set('begin', (...x: any) => x[x.length - 1])
  env.set('car', (...x: any[]) => x[0])
  env.set('cdr', (...x: any[]) => x.slice(1))
  env.set('cons', (x: any, y: any[]) => [x, ...y])
  env.set('eq?', (a: any, b: any) => Object.is(a, b))
  env.set('equal?', (a: any, b: any) => deepEqual(a, b))
  env.set('expt', Math.pow)
  env.set('length', (x: any[]) => x.length)
  env.set('list', (...x: any[]) => Array.from(x))
  env.set('list?', (x: any) => Array.isArray(x))
  env.set('map', (func: (value: any, index: number, array: any[]) => unknown, arr: any[]) => arr.map(func))
  env.set('not', (x: boolean) => !x)
  env.set('null?', (x: any[]) => x.length === 0)
  env.set('number?', (x: any) => typeof x === 'number')
  env.set('print', console.log)
  env.set('pi', Math.PI)
  env.set('procedure?', (x: any) => typeof x === 'function')
  env.set('symbol?', (x: any) => x instanceof LSymbol)

  Object.entries(Math).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      acc.set(key,value)
    }
    return acc
  },env)
  return env
}

const globalEnv = standardEnv()

/**
 * Evaluate an expression in an environment.
 */
const evalScheme = (x: Exp, env = globalEnv): Exp => {
  if (typeof x === 'string') {
    // variable reference
    return env.get(x) ?? new Error('Undefined symbol:' + x)
  } else if (typeof x === 'number') {
    return x
  } else if (Array.isArray(x) && x[0] === 'if') {
    const [_, test, consq, alt] = x
    const exp = evalScheme(test, env) ? consq : alt
    return evalScheme(exp, env)
  } else if (Array.isArray(x) && x[0] === 'define') {
    const [_, symbol, exp] = x
    const value = evalScheme(exp, env)
    env.set(symbol, value)
    return value
  } else {
    const [op, ...args] = (x as List).map((e: Exp) => evalScheme(e, env))

    if (typeof op === 'function') {
      return (op as Function)(...args)
    } else {
      throw new Error(`${op} is not function`)
    }
  }
}

console.log(evalScheme(parse(program)))
