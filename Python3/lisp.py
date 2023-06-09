## (c) Peter Norvig, 2010-16; See http://norvig.com/lispy.html

program = "(begin (define r 10) (* pi (* r r)))"
################ Types

Symbol = str
List   = list     
Number = (int, float)
Atom = (Symbol, Number)
Exp = (Atom, list)
Env = dict

################ Parsing: parse, tokenize, and read_from_tokens

def parse(program:str) -> Exp:
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
    try: return int(token)
    except ValueError:
        try: return float(token)
        except ValueError:
            return Symbol(token)

print(parse(program))