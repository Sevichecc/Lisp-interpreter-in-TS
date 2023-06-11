# (c) Peter Norvig, 2010-16; See http://norvig.com/lispy.html
import math
import operator as op

program = "(begin (define r 10) (* pi (* r r)))"
################ Types

Symbol = str
List = list
Number = (int, float)
Atom = (Symbol, Number)
Exp = (Atom, list)
Env = dict

################ Parsing: parse, tokenize, and read_from_tokens

def parse(program: str) -> Exp:
    "Read a Scheme expression from a string."
    return read_from_tokens(tokenize(program))

def tokenize(chars: str) -> list:
    "Convert a string of characters into list of tokens."
    return chars.replace('(', ' ( ').replace(')', ' ) ').split()

def read_from_tokens(tokens: list) -> Exp:
    "Read an expression from a sequence of tokens."
    if len(tokens) == 0:
        raise SyntaxError('unexpected EOF while reading')
    token = tokens.pop(0)
    if token == '(':
        L = []
        while tokens[0] != ')':
            L.append(read_from_tokens(tokens))
        tokens.pop(0)
        return L
    elif token == ')':
        raise SyntaxError('unexpected )')
    else:
        return atom(token)

def atom(token: str) -> Atom:
    "Numbers become numbers; every other token is a symbol."
    try:
        return int(token)
    except ValueError:
        try:
            return float(token)
        except ValueError:
            return Symbol(token)

# Environments
def standard_env() -> Env:
    'An environment with some Scheme standard procedures'
    env = Env()
    env.update(vars(math))
    env.update({
        '+': op.add, '-': op.sub, '*': op.mul, '/': op.truediv,
        '>': op.gt, '<': op.lt, '>=': op.ge, '<=': op.le, '=': op.eq,
        'abs': abs,
        'append': op.add,
        'apply': lambda proc, args: proc(args),
        'begin': lambda *x: x[-1],
        'car': lambda x: x[0],
        'cdr': lambda x: x[1:],
        'cons': lambda x, y: [x]+y,
        'eq?': op.is_,
        'equal?': op.eq,
        'expt': pow,
        'length': len,
        'list': lambda *x: list(x),
        'list?': lambda x: isinstance(x, List),
        'map': map,
        'max': max,
        'min': min,
        'not': op.not_,
        'null?': lambda x: x == [],
        'number?': lambda x : isinstance(x, Number),
        'print': print,
        'procedure?': callable,
        'round': round,
        'symbol?': lambda x : isinstance(x, Symbol),

    })
    return env

global_env = standard_env()

def eval(x: Exp, env=global_env) -> Exp:
    'Evaluate an expression in an environment.'
    if isinstance(x, Symbol):
        return env[x]
    elif isinstance(x, Number):
        return x
    elif x[0] == 'if':
        (_,test,conseq,alt) = x
        exp = ( conseq if eval(test,env) else alt)
        return eval(exp, env)
    elif x[0] == 'define':
        (_,symbol, exp) = x
        env[symbol] = eval(exp,env)
    else:
        proc = eval(x[0], env)
        args = [eval(arg,env) for arg in x[1:]]
        return proc(*args)
    
print(eval(parse(program)))

    
    