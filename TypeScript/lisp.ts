// Lispts: Scheme Interpreter in TypeScript

const program = "(begin (define r 10) (* pi (* r r)))"

// types
type LSymbolType = string // A Lisp Symbol(alias TSymbol) is implemented as TypeScript string
type LNumber = number // A Lisp Symbol(alias TSymbol) is implemented as TypeScript number
type Atom = LSymbolType | number // A Lisp Atom is a Symbol or Number impl
type List = Array<any> // A Lisp List is implemented as a TypeScript array
type Exp = Atom | List // A Lisp expression is an Atom or List
type Env = Map<string, any>;

class LSymbol {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }
}

// utils
const deepEqual = (a: any, b: any): boolean =>{
  if(a=== b) return true

  if(typeof a !== 'object'|| typeof b !== 'object' || a === null || b === null )
  return false

  const keyA = Object.keys(a)
  const keyB = Object.keys(b)

  if(keyA.length !== keyB.length) return false


  for(const key of keyA){
    if(!keyB.includes(key) || !deepEqual(a[key], b[key])) return false
  }
  
  return true
}

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
  isNaN(Number(token)) ? token as LSymbolType : Number(token)

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

// Environments
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
  env.set('abs', Math.abs)
  env.set('append', (a: any[], b: any[]) => a.concat(b))
  env.set('apply', (proc: Function, args: any[]) => proc(...args))
  env.set('begin', (...x: any) => x[x.length - 1])
  env.set('car', (...x: any) => x[0])
  env.set('cdr', (...x: any) => x.slice(1))
  env.set('cons', (x: any, y: any) => [x, ...y])
  env.set('eq?', (a: any, b: any) => Object.is(a, b))
  env.set('equal?', (a: any, b: any) => deepEqual(a, b))
  env.set('expt', Math.pow)
  env.set('length', (x: any[]) => x.length)
  env.set('list', (...x: any[]) => Array.from(x))
  env.set('list?', (x: any) => Array.isArray(x))
  env.set('map', Array.prototype.map)
  env.set('max', Math.max)
  env.set('min', Math.min)
  env.set('not', (x: boolean) => !x)
  env.set('null?', (x: any[]) => x.length === 0)
  env.set('number?', (x: any) => typeof x === 'number')
  env.set('print', console.log)
  env.set('procedure?', (x: any) => typeof x === 'function')
  env.set('round', Math.round)
  env.set('symbol?', (x: any) =>x instanceof LSymbol )
  return env
}

const globalEnv = standardEnv()