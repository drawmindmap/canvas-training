(function () {
  'use strict';

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function (it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var document$1 = _global.document;
  // typeof document.createElement is 'object' in old IE
  var is = _isObject(document$1) && _isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;

  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);
    P = _toPrimitive(P, true);
    _anObject(Attributes);
    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
  	f: f
  };

  var dP$1 = _objectDp.f;
  var FProto = Function.prototype;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name';

  // 19.2.4.2 name
  NAME in FProto || _descriptors && dP$1(FProto, NAME, {
    configurable: true,
    get: function () {
      try {
        return ('' + this).match(nameRE)[1];
      } catch (e) {
        return '';
      }
    }
  });

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  // 21.2.5.3 get RegExp.prototype.flags

  var _flags = function () {
    var that = _anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  // 21.2.5.3 get RegExp.prototype.flags()
  if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: _flags
  });

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var _core = createCommonjsModule(function (module) {
  var core = module.exports = { version: '2.6.5' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _library = false;

  var _shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global[SHARED] || (_global[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core.version,
    mode: 'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var _functionToString = _shared('native-function-to-string', Function.toString);

  var _redefine = createCommonjsModule(function (module) {
  var SRC = _uid('src');

  var TO_STRING = 'toString';
  var TPL = ('' + _functionToString).split(TO_STRING);

  _core.inspectSource = function (it) {
    return _functionToString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    if (O === _global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      _hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      _hide(O, key, val);
    }
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || _functionToString.call(this);
  });
  });

  var TO_STRING = 'toString';
  var $toString = /./[TO_STRING];

  var define = function (fn) {
    _redefine(RegExp.prototype, TO_STRING, fn, true);
  };

  // 21.2.5.14 RegExp.prototype.toString()
  if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
    define(function toString() {
      var R = _anObject(this);
      return '/'.concat(R.source, '/',
        'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
    });
  // FF44- RegExp#toString has a wrong name
  } else if ($toString.name != TO_STRING) {
    define(function toString() {
      return $toString.call(this);
    });
  }

  var DateProto = Date.prototype;
  var INVALID_DATE = 'Invalid Date';
  var TO_STRING$1 = 'toString';
  var $toString$1 = DateProto[TO_STRING$1];
  var getTime = DateProto.getTime;
  if (new Date(NaN) + '' != INVALID_DATE) {
    _redefine(DateProto, TO_STRING$1, function toString() {
      var value = getTime.call(this);
      // eslint-disable-next-line no-self-compare
      return value === value ? $toString$1.call(this) : INVALID_DATE;
    });
  }

  // 7.2.9 SameValue(x, y)
  var _sameValue = Object.is || function is(x, y) {
    // eslint-disable-next-line no-self-compare
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };

  var toString = {}.toString;

  var _cof = function (it) {
    return toString.call(it).slice(8, -1);
  };

  var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');

  var Symbol = _global.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
  });

  // getting tag from 19.1.3.6 Object.prototype.toString()

  var TAG = _wks('toStringTag');
  // ES3 wrong here
  var ARG = _cof(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (e) { /* empty */ }
  };

  var _classof = function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
      // builtinTag case
      : ARG ? _cof(O)
      // ES3 arguments fallback
      : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };

  var builtinExec = RegExp.prototype.exec;

   // `RegExpExec` abstract operation
  // https://tc39.github.io/ecma262/#sec-regexpexec
  var _regexpExecAbstract = function (R, S) {
    var exec = R.exec;
    if (typeof exec === 'function') {
      var result = exec.call(R, S);
      if (typeof result !== 'object') {
        throw new TypeError('RegExp exec method returned something other than an Object or null');
      }
      return result;
    }
    if (_classof(R) !== 'RegExp') {
      throw new TypeError('RegExp#exec called on incompatible receiver');
    }
    return builtinExec.call(R, S);
  };

  var nativeExec = RegExp.prototype.exec;
  // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.
  var nativeReplace = String.prototype.replace;

  var patchedExec = nativeExec;

  var LAST_INDEX = 'lastIndex';

  var UPDATES_LAST_INDEX_WRONG = (function () {
    var re1 = /a/,
        re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
  })();

  // nonparticipating capturing group, copied from es5-shim's String#split patch.
  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
      }
      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

      match = nativeExec.call(re, str);

      if (UPDATES_LAST_INDEX_WRONG && match) {
        re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
      }
      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        // eslint-disable-next-line no-loop-func
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var _regexpExec = patchedExec;

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    _aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    var key, own, out, exp;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      // export native or passed
      out = (own ? target : source)[key];
      // bind timers to global for call from export context
      exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
      // extend global
      if (target) _redefine(target, key, out, type & $export.U);
      // export
      if (exports[key] != out) _hide(exports, key, exp);
      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    }
  };
  _global.core = _core;
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  _export({
    target: 'RegExp',
    proto: true,
    forced: _regexpExec !== /./.exec
  }, {
    exec: _regexpExec
  });

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  var SPECIES = _wks('species');

  var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;
    re.exec = function () {
      var result = [];
      result.groups = { a: '7' };
      return result;
    };
    return ''.replace(re, '$<a>') !== '7';
  });

  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
    // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
    var re = /(?:)/;
    var originalExec = re.exec;
    re.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re);
    return result.length === 2 && result[0] === 'a' && result[1] === 'b';
  })();

  var _fixReWks = function (KEY, length, exec) {
    var SYMBOL = _wks(KEY);

    var DELEGATES_TO_SYMBOL = !_fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};
      O[SYMBOL] = function () { return 7; };
      return ''[KEY](O) != 7;
    });

    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;
      re.exec = function () { execCalled = true; return null; };
      if (KEY === 'split') {
        // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.
        re.constructor = {};
        re.constructor[SPECIES] = function () { return re; };
      }
      re[SYMBOL]('');
      return !execCalled;
    }) : undefined;

    if (
      !DELEGATES_TO_SYMBOL ||
      !DELEGATES_TO_EXEC ||
      (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
      (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
    ) {
      var nativeRegExpMethod = /./[SYMBOL];
      var fns = exec(
        _defined,
        SYMBOL,
        ''[KEY],
        function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
          if (regexp.exec === _regexpExec) {
            if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
              // The native String method already delegates to @@method (this
              // polyfilled function), leasing to infinite recursion.
              // We avoid it by directly calling the native @@method method.
              return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
            }
            return { done: true, value: nativeMethod.call(str, regexp, arg2) };
          }
          return { done: false };
        }
      );
      var strfn = fns[0];
      var rxfn = fns[1];

      _redefine(String.prototype, KEY, strfn);
      _hide(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) { return rxfn.call(string, this, arg); }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) { return rxfn.call(string, this); }
      );
    }
  };

  // @@search logic
  _fixReWks('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
    return [
      // `String.prototype.search` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.search
      function search(regexp) {
        var O = defined(this);
        var fn = regexp == undefined ? undefined : regexp[SEARCH];
        return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
      },
      // `RegExp.prototype[@@search]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
      function (regexp) {
        var res = maybeCallNative($search, regexp, this);
        if (res.done) return res.value;
        var rx = _anObject(regexp);
        var S = String(this);
        var previousLastIndex = rx.lastIndex;
        if (!_sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
        var result = _regexpExecAbstract(rx, S);
        if (!_sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
        return result === null ? -1 : result.index;
      }
    ];
  });

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  // 22.1.3.31 Array.prototype[@@unscopables]
  var UNSCOPABLES = _wks('unscopables');
  var ArrayProto = Array.prototype;
  if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
  var _addToUnscopables = function (key) {
    ArrayProto[UNSCOPABLES][key] = true;
  };

  var _iterStep = function (done, value) {
    return { value: value, done: !!done };
  };

  var _iterators = {};

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  };

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return _iobject(_defined(it));
  };

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  // 7.1.15 ToLength

  var min = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);
      var length = _toLength(O.length);
      var index = _toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var shared = _shared('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);
  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = _toIobject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);
    var keys = _objectKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$2 = _global.document;
  var _html = document$2 && document$2.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = _sharedKey('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');
    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : _objectDps(result, Properties);
  };

  var def = _objectDp.f;

  var TAG$1 = _wks('toStringTag');

  var _setToStringTag = function (it, tag, stat) {
    if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, { configurable: true, value: tag });
  };

  var IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

  var _iterCreate = function (Constructor, NAME, next) {
    Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
    _setToStringTag(Constructor, NAME + ' Iterator');
  };

  // 7.1.13 ToObject(argument)

  var _toObject = function (it) {
    return Object(_defined(it));
  };

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2 = _sharedKey('IE_PROTO');
  var ObjectProto = Object.prototype;

  var _objectGpo = Object.getPrototypeOf || function (O) {
    O = _toObject(O);
    if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  };

  var ITERATOR = _wks('iterator');
  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var returnThis = function () { return this; };

  var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS: return function keys() { return new Constructor(this, kind); };
        case VALUES: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = _objectGpo($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag(IteratorPrototype, TAG, true);
        // fix for some old engines
        if (typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if (BUGGY || VALUES_BUG || !proto[ITERATOR]) {
      _hide(proto, ITERATOR, $default);
    }
    // Plug for library
    _iterators[NAME] = $default;
    _iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine(proto, key, methods[key]);
      } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };

  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
    this._t = _toIobject(iterated); // target
    this._i = 0;                   // next index
    this._k = kind;                // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return _iterStep(1);
    }
    if (kind == 'keys') return _iterStep(0, index);
    if (kind == 'values') return _iterStep(0, O[index]);
    return _iterStep(0, [index, O[index]]);
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  _iterators.Arguments = _iterators.Array;

  _addToUnscopables('keys');
  _addToUnscopables('values');
  _addToUnscopables('entries');

  var ITERATOR$1 = _wks('iterator');
  var TO_STRING_TAG = _wks('toStringTag');
  var ArrayValues = _iterators.Array;

  var DOMIterables = {
    CSSRuleList: true, // TODO: Not spec compliant, should be false.
    CSSStyleDeclaration: false,
    CSSValueList: false,
    ClientRectList: false,
    DOMRectList: false,
    DOMStringList: false,
    DOMTokenList: true,
    DataTransferItemList: false,
    FileList: false,
    HTMLAllCollection: false,
    HTMLCollection: false,
    HTMLFormElement: false,
    HTMLSelectElement: false,
    MediaList: true, // TODO: Not spec compliant, should be false.
    MimeTypeArray: false,
    NamedNodeMap: false,
    NodeList: true,
    PaintRequestList: false,
    Plugin: false,
    PluginArray: false,
    SVGLengthList: false,
    SVGNumberList: false,
    SVGPathSegList: false,
    SVGPointList: false,
    SVGStringList: false,
    SVGTransformList: false,
    SourceBufferList: false,
    StyleSheetList: true, // TODO: Not spec compliant, should be false.
    TextTrackCueList: false,
    TextTrackList: false,
    TouchList: false
  };

  for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
    var NAME$1 = collections[i];
    var explicit = DOMIterables[NAME$1];
    var Collection = _global[NAME$1];
    var proto = Collection && Collection.prototype;
    var key;
    if (proto) {
      if (!proto[ITERATOR$1]) _hide(proto, ITERATOR$1, ArrayValues);
      if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME$1);
      _iterators[NAME$1] = ArrayValues;
      if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
    }
  }

  // 19.1.3.6 Object.prototype.toString()

  var test = {};
  test[_wks('toStringTag')] = 'z';
  if (test + '' != '[object z]') {
    _redefine(Object.prototype, 'toString', function toString() {
      return '[object ' + _classof(this) + ']';
    }, true);
  }

  // most Object methods by ES6 should accept primitives



  var _objectSap = function (KEY, exec) {
    var fn = (_core.Object || {})[KEY] || Object[KEY];
    var exp = {};
    exp[KEY] = exec(fn);
    _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
  };

  // 19.1.2.14 Object.keys(O)



  _objectSap('keys', function () {
    return function keys(it) {
      return _objectKeys(_toObject(it));
    };
  });

  // 7.2.2 IsArray(argument)

  var _isArray = Array.isArray || function isArray(arg) {
    return _cof(arg) == 'Array';
  };

  var SPECIES$1 = _wks('species');

  var _arraySpeciesConstructor = function (original) {
    var C;
    if (_isArray(original)) {
      C = original.constructor;
      // cross-realm fallback
      if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
      if (_isObject(C)) {
        C = C[SPECIES$1];
        if (C === null) C = undefined;
      }
    } return C === undefined ? Array : C;
  };

  // 9.4.2.3 ArraySpeciesCreate(originalArray, length)


  var _arraySpeciesCreate = function (original, length) {
    return new (_arraySpeciesConstructor(original))(length);
  };

  // 0 -> Array#forEach
  // 1 -> Array#map
  // 2 -> Array#filter
  // 3 -> Array#some
  // 4 -> Array#every
  // 5 -> Array#find
  // 6 -> Array#findIndex





  var _arrayMethods = function (TYPE, $create) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    var create = $create || _arraySpeciesCreate;
    return function ($this, callbackfn, that) {
      var O = _toObject($this);
      var self = _iobject(O);
      var f = _ctx(callbackfn, that, 3);
      var length = _toLength(self.length);
      var index = 0;
      var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var val, res;
      for (;length > index; index++) if (NO_HOLES || index in self) {
        val = self[index];
        res = f(val, index, O);
        if (TYPE) {
          if (IS_MAP) result[index] = res;   // map
          else if (res) switch (TYPE) {
            case 3: return true;             // some
            case 5: return val;              // find
            case 6: return index;            // findIndex
            case 2: result.push(val);        // filter
          } else if (IS_EVERY) return false; // every
        }
      }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
    };
  };

  var _strictMethod = function (method, arg) {
    return !!method && _fails(function () {
      // eslint-disable-next-line no-useless-call
      arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
    });
  };

  var $forEach = _arrayMethods(0);
  var STRICT = _strictMethod([].forEach, true);

  _export(_export.P + _export.F * !STRICT, 'Array', {
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: function forEach(callbackfn /* , thisArg */) {
      return $forEach(this, callbackfn, arguments[1]);
    }
  });

  /**
   * dat-gui JavaScript Controller Library
   * http://code.google.com/p/dat-gui
   *
   * Copyright 2011 Data Arts Team, Google Creative Lab
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   */

  function ___$insertStyle(css) {
    if (!css) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }

    var style = document.createElement('style');

    style.setAttribute('type', 'text/css');
    style.innerHTML = css;
    document.head.appendChild(style);

    return css;
  }

  function colorToString (color, forceCSSHex) {
    var colorFormat = color.__state.conversionName.toString();
    var r = Math.round(color.r);
    var g = Math.round(color.g);
    var b = Math.round(color.b);
    var a = color.a;
    var h = Math.round(color.h);
    var s = color.s.toFixed(1);
    var v = color.v.toFixed(1);
    if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
      var str = color.hex.toString(16);
      while (str.length < 6) {
        str = '0' + str;
      }
      return '#' + str;
    } else if (colorFormat === 'CSS_RGB') {
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } else if (colorFormat === 'CSS_RGBA') {
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    } else if (colorFormat === 'HEX') {
      return '0x' + color.hex.toString(16);
    } else if (colorFormat === 'RGB_ARRAY') {
      return '[' + r + ',' + g + ',' + b + ']';
    } else if (colorFormat === 'RGBA_ARRAY') {
      return '[' + r + ',' + g + ',' + b + ',' + a + ']';
    } else if (colorFormat === 'RGB_OBJ') {
      return '{r:' + r + ',g:' + g + ',b:' + b + '}';
    } else if (colorFormat === 'RGBA_OBJ') {
      return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
    } else if (colorFormat === 'HSV_OBJ') {
      return '{h:' + h + ',s:' + s + ',v:' + v + '}';
    } else if (colorFormat === 'HSVA_OBJ') {
      return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
    }
    return 'unknown format';
  }

  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;
  var Common = {
    BREAK: {},
    extend: function extend(target) {
      this.each(ARR_SLICE.call(arguments, 1), function (obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function (key) {
          if (!this.isUndefined(obj[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    defaults: function defaults(target) {
      this.each(ARR_SLICE.call(arguments, 1), function (obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function (key) {
          if (this.isUndefined(target[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    compose: function compose() {
      var toCall = ARR_SLICE.call(arguments);
      return function () {
        var args = ARR_SLICE.call(arguments);
        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [toCall[i].apply(this, args)];
        }
        return args[0];
      };
    },
    each: function each(obj, itr, scope) {
      if (!obj) {
        return;
      }
      if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        var key = void 0;
        var l = void 0;
        for (key = 0, l = obj.length; key < l; key++) {
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
            return;
          }
        }
      } else {
        for (var _key in obj) {
          if (itr.call(scope, obj[_key], _key) === this.BREAK) {
            return;
          }
        }
      }
    },
    defer: function defer(fnc) {
      setTimeout(fnc, 0);
    },
    debounce: function debounce(func, threshold, callImmediately) {
      var timeout = void 0;
      return function () {
        var obj = this;
        var args = arguments;
        function delayed() {
          timeout = null;
          if (!callImmediately) func.apply(obj, args);
        }
        var callNow = callImmediately || !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(delayed, threshold);
        if (callNow) {
          func.apply(obj, args);
        }
      };
    },
    toArray: function toArray(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },
    isUndefined: function isUndefined(obj) {
      return obj === undefined;
    },
    isNull: function isNull(obj) {
      return obj === null;
    },
    isNaN: function (_isNaN) {
      function isNaN(_x) {
        return _isNaN.apply(this, arguments);
      }
      isNaN.toString = function () {
        return _isNaN.toString();
      };
      return isNaN;
    }(function (obj) {
      return isNaN(obj);
    }),
    isArray: Array.isArray || function (obj) {
      return obj.constructor === Array;
    },
    isObject: function isObject(obj) {
      return obj === Object(obj);
    },
    isNumber: function isNumber(obj) {
      return obj === obj + 0;
    },
    isString: function isString(obj) {
      return obj === obj + '';
    },
    isBoolean: function isBoolean(obj) {
      return obj === false || obj === true;
    },
    isFunction: function isFunction(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  };

  var INTERPRETATIONS = [
  {
    litmus: Common.isString,
    conversions: {
      THREE_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) {
            return false;
          }
          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
          };
        },
        write: colorToString
      },
      SIX_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) {
            return false;
          }
          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString(), 0)
          };
        },
        write: colorToString
      },
      CSS_RGB: {
        read: function read(original) {
          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3])
          };
        },
        write: colorToString
      },
      CSS_RGBA: {
        read: function read(original) {
          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4])
          };
        },
        write: colorToString
      }
    }
  },
  {
    litmus: Common.isNumber,
    conversions: {
      HEX: {
        read: function read(original) {
          return {
            space: 'HEX',
            hex: original,
            conversionName: 'HEX'
          };
        },
        write: function write(color) {
          return color.hex;
        }
      }
    }
  },
  {
    litmus: Common.isArray,
    conversions: {
      RGB_ARRAY: {
        read: function read(original) {
          if (original.length !== 3) {
            return false;
          }
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2]
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b];
        }
      },
      RGBA_ARRAY: {
        read: function read(original) {
          if (original.length !== 4) return false;
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3]
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b, color.a];
        }
      }
    }
  },
  {
    litmus: Common.isObject,
    conversions: {
      RGBA_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a
          };
        }
      },
      RGB_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b
          };
        }
      },
      HSVA_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
            a: color.a
          };
        }
      },
      HSV_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v
          };
        }
      }
    }
  }];
  var result = void 0;
  var toReturn = void 0;
  var interpret = function interpret() {
    toReturn = false;
    var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
    Common.each(INTERPRETATIONS, function (family) {
      if (family.litmus(original)) {
        Common.each(family.conversions, function (conversion, conversionName) {
          result = conversion.read(original);
          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return Common.BREAK;
          }
        });
        return Common.BREAK;
      }
    });
    return toReturn;
  };

  var tmpComponent = void 0;
  var ColorMath = {
    hsv_to_rgb: function hsv_to_rgb(h, s, v) {
      var hi = Math.floor(h / 60) % 6;
      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - f * s);
      var t = v * (1.0 - (1.0 - f) * s);
      var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };
    },
    rgb_to_hsv: function rgb_to_hsv(r, g, b) {
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h = void 0;
      var s = void 0;
      if (max !== 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }
      if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }
      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },
    rgb_to_hex: function rgb_to_hex(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },
    component_from_hex: function component_from_hex(hex, componentIndex) {
      return hex >> componentIndex * 8 & 0xFF;
    },
    hex_with_component: function hex_with_component(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
    }
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };











  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();







  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };











  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var Color = function () {
    function Color() {
      classCallCheck(this, Color);
      this.__state = interpret.apply(this, arguments);
      if (this.__state === false) {
        throw new Error('Failed to interpret color arguments');
      }
      this.__state.a = this.__state.a || 1;
    }
    createClass(Color, [{
      key: 'toString',
      value: function toString() {
        return colorToString(this);
      }
    }, {
      key: 'toHexString',
      value: function toHexString() {
        return colorToString(this, true);
      }
    }, {
      key: 'toOriginal',
      value: function toOriginal() {
        return this.__state.conversion.write(this);
      }
    }]);
    return Color;
  }();
  function defineRGBComponent(target, component, componentHexIndex) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }
        Color.recalculateRGB(this, component, componentHexIndex);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== 'RGB') {
          Color.recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }
        this.__state[component] = v;
      }
    });
  }
  function defineHSVComponent(target, component) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === 'HSV') {
          return this.__state[component];
        }
        Color.recalculateHSV(this);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== 'HSV') {
          Color.recalculateHSV(this);
          this.__state.space = 'HSV';
        }
        this.__state[component] = v;
      }
    });
  }
  Color.recalculateRGB = function (color, component, componentHexIndex) {
    if (color.__state.space === 'HEX') {
      color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
    } else if (color.__state.space === 'HSV') {
      Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
    } else {
      throw new Error('Corrupted color state');
    }
  };
  Color.recalculateHSV = function (color) {
    var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
    Common.extend(color.__state, {
      s: result.s,
      v: result.v
    });
    if (!Common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (Common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }
  };
  Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);
  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');
  Object.defineProperty(Color.prototype, 'a', {
    get: function get$$1() {
      return this.__state.a;
    },
    set: function set$$1(v) {
      this.__state.a = v;
    }
  });
  Object.defineProperty(Color.prototype, 'hex', {
    get: function get$$1() {
      if (!this.__state.space !== 'HEX') {
        this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      }
      return this.__state.hex;
    },
    set: function set$$1(v) {
      this.__state.space = 'HEX';
      this.__state.hex = v;
    }
  });

  var Controller = function () {
    function Controller(object, property) {
      classCallCheck(this, Controller);
      this.initialValue = object[property];
      this.domElement = document.createElement('div');
      this.object = object;
      this.property = property;
      this.__onChange = undefined;
      this.__onFinishChange = undefined;
    }
    createClass(Controller, [{
      key: 'onChange',
      value: function onChange(fnc) {
        this.__onChange = fnc;
        return this;
      }
    }, {
      key: 'onFinishChange',
      value: function onFinishChange(fnc) {
        this.__onFinishChange = fnc;
        return this;
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        this.object[this.property] = newValue;
        if (this.__onChange) {
          this.__onChange.call(this, newValue);
        }
        this.updateDisplay();
        return this;
      }
    }, {
      key: 'getValue',
      value: function getValue() {
        return this.object[this.property];
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        return this;
      }
    }, {
      key: 'isModified',
      value: function isModified() {
        return this.initialValue !== this.getValue();
      }
    }]);
    return Controller;
  }();

  var EVENT_MAP = {
    HTMLEvents: ['change'],
    MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
    KeyboardEvents: ['keydown']
  };
  var EVENT_MAP_INV = {};
  Common.each(EVENT_MAP, function (v, k) {
    Common.each(v, function (e) {
      EVENT_MAP_INV[e] = k;
    });
  });
  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
  function cssValueToPixels(val) {
    if (val === '0' || Common.isUndefined(val)) {
      return 0;
    }
    var match = val.match(CSS_VALUE_PIXELS);
    if (!Common.isNull(match)) {
      return parseFloat(match[1]);
    }
    return 0;
  }
  var dom = {
    makeSelectable: function makeSelectable(elem, selectable) {
      if (elem === undefined || elem.style === undefined) return;
      elem.onselectstart = selectable ? function () {
        return false;
      } : function () {};
      elem.style.MozUserSelect = selectable ? 'auto' : 'none';
      elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
      elem.unselectable = selectable ? 'on' : 'off';
    },
    makeFullscreen: function makeFullscreen(elem, hor, vert) {
      var vertical = vert;
      var horizontal = hor;
      if (Common.isUndefined(horizontal)) {
        horizontal = true;
      }
      if (Common.isUndefined(vertical)) {
        vertical = true;
      }
      elem.style.position = 'absolute';
      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }
      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }
    },
    fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
      var params = pars || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error('Event type ' + eventType + ' not supported.');
      }
      var evt = document.createEvent(className);
      switch (className) {
        case 'MouseEvents':
          {
            var clientX = params.x || params.clientX || 0;
            var clientY = params.y || params.clientY || 0;
            evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
            0,
            clientX,
            clientY,
            false, false, false, false, 0, null);
            break;
          }
        case 'KeyboardEvents':
          {
            var init = evt.initKeyboardEvent || evt.initKeyEvent;
            Common.defaults(params, {
              cancelable: true,
              ctrlKey: false,
              altKey: false,
              shiftKey: false,
              metaKey: false,
              keyCode: undefined,
              charCode: undefined
            });
            init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
            break;
          }
        default:
          {
            evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
            break;
          }
      }
      Common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },
    bind: function bind(elem, event, func, newBool) {
      var bool = newBool || false;
      if (elem.addEventListener) {
        elem.addEventListener(event, func, bool);
      } else if (elem.attachEvent) {
        elem.attachEvent('on' + event, func);
      }
      return dom;
    },
    unbind: function unbind(elem, event, func, newBool) {
      var bool = newBool || false;
      if (elem.removeEventListener) {
        elem.removeEventListener(event, func, bool);
      } else if (elem.detachEvent) {
        elem.detachEvent('on' + event, func);
      }
      return dom;
    },
    addClass: function addClass(elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) === -1) {
          classes.push(className);
          elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
        }
      }
      return dom;
    },
    removeClass: function removeClass(elem, className) {
      if (className) {
        if (elem.className === className) {
          elem.removeAttribute('class');
        } else {
          var classes = elem.className.split(/ +/);
          var index = classes.indexOf(className);
          if (index !== -1) {
            classes.splice(index, 1);
            elem.className = classes.join(' ');
          }
        }
      } else {
        elem.className = undefined;
      }
      return dom;
    },
    hasClass: function hasClass(elem, className) {
      return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
    },
    getWidth: function getWidth(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
    },
    getHeight: function getHeight(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
    },
    getOffset: function getOffset(el) {
      var elem = el;
      var offset = { left: 0, top: 0 };
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
          elem = elem.offsetParent;
        } while (elem);
      }
      return offset;
    },
    isActive: function isActive(elem) {
      return elem === document.activeElement && (elem.type || elem.href);
    }
  };

  var BooleanController = function (_Controller) {
    inherits(BooleanController, _Controller);
    function BooleanController(object, property) {
      classCallCheck(this, BooleanController);
      var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
      var _this = _this2;
      _this2.__prev = _this2.getValue();
      _this2.__checkbox = document.createElement('input');
      _this2.__checkbox.setAttribute('type', 'checkbox');
      function onChange() {
        _this.setValue(!_this.__prev);
      }
      dom.bind(_this2.__checkbox, 'change', onChange, false);
      _this2.domElement.appendChild(_this2.__checkbox);
      _this2.updateDisplay();
      return _this2;
    }
    createClass(BooleanController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        this.__prev = this.getValue();
        return toReturn;
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (this.getValue() === true) {
          this.__checkbox.setAttribute('checked', 'checked');
          this.__checkbox.checked = true;
          this.__prev = true;
        } else {
          this.__checkbox.checked = false;
          this.__prev = false;
        }
        return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return BooleanController;
  }(Controller);

  var OptionController = function (_Controller) {
    inherits(OptionController, _Controller);
    function OptionController(object, property, opts) {
      classCallCheck(this, OptionController);
      var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
      var options = opts;
      var _this = _this2;
      _this2.__select = document.createElement('select');
      if (Common.isArray(options)) {
        var map = {};
        Common.each(options, function (element) {
          map[element] = element;
        });
        options = map;
      }
      Common.each(options, function (value, key) {
        var opt = document.createElement('option');
        opt.innerHTML = key;
        opt.setAttribute('value', value);
        _this.__select.appendChild(opt);
      });
      _this2.updateDisplay();
      dom.bind(_this2.__select, 'change', function () {
        var desiredValue = this.options[this.selectedIndex].value;
        _this.setValue(desiredValue);
      });
      _this2.domElement.appendChild(_this2.__select);
      return _this2;
    }
    createClass(OptionController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        return toReturn;
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (dom.isActive(this.__select)) return this;
        this.__select.value = this.getValue();
        return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return OptionController;
  }(Controller);

  var StringController = function (_Controller) {
    inherits(StringController, _Controller);
    function StringController(object, property) {
      classCallCheck(this, StringController);
      var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
      var _this = _this2;
      function onChange() {
        _this.setValue(_this.__input.value);
      }
      function onBlur() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      _this2.__input = document.createElement('input');
      _this2.__input.setAttribute('type', 'text');
      dom.bind(_this2.__input, 'keyup', onChange);
      dom.bind(_this2.__input, 'change', onChange);
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          this.blur();
        }
      });
      _this2.updateDisplay();
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    createClass(StringController, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (!dom.isActive(this.__input)) {
          this.__input.value = this.getValue();
        }
        return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return StringController;
  }(Controller);

  function numDecimals(x) {
    var _x = x.toString();
    if (_x.indexOf('.') > -1) {
      return _x.length - _x.indexOf('.') - 1;
    }
    return 0;
  }
  var NumberController = function (_Controller) {
    inherits(NumberController, _Controller);
    function NumberController(object, property, params) {
      classCallCheck(this, NumberController);
      var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
      var _params = params || {};
      _this.__min = _params.min;
      _this.__max = _params.max;
      _this.__step = _params.step;
      if (Common.isUndefined(_this.__step)) {
        if (_this.initialValue === 0) {
          _this.__impliedStep = 1;
        } else {
          _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
        }
      } else {
        _this.__impliedStep = _this.__step;
      }
      _this.__precision = numDecimals(_this.__impliedStep);
      return _this;
    }
    createClass(NumberController, [{
      key: 'setValue',
      value: function setValue(v) {
        var _v = v;
        if (this.__min !== undefined && _v < this.__min) {
          _v = this.__min;
        } else if (this.__max !== undefined && _v > this.__max) {
          _v = this.__max;
        }
        if (this.__step !== undefined && _v % this.__step !== 0) {
          _v = Math.round(_v / this.__step) * this.__step;
        }
        return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
      }
    }, {
      key: 'min',
      value: function min(minValue) {
        this.__min = minValue;
        return this;
      }
    }, {
      key: 'max',
      value: function max(maxValue) {
        this.__max = maxValue;
        return this;
      }
    }, {
      key: 'step',
      value: function step(stepValue) {
        this.__step = stepValue;
        this.__impliedStep = stepValue;
        this.__precision = numDecimals(stepValue);
        return this;
      }
    }]);
    return NumberController;
  }(Controller);

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }
  var NumberControllerBox = function (_NumberController) {
    inherits(NumberControllerBox, _NumberController);
    function NumberControllerBox(object, property, params) {
      classCallCheck(this, NumberControllerBox);
      var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
      _this2.__truncationSuspended = false;
      var _this = _this2;
      var prevY = void 0;
      function onChange() {
        var attempted = parseFloat(_this.__input.value);
        if (!Common.isNaN(attempted)) {
          _this.setValue(attempted);
        }
      }
      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      function onBlur() {
        onFinish();
      }
      function onMouseDrag(e) {
        var diff = prevY - e.clientY;
        _this.setValue(_this.getValue() + diff * _this.__impliedStep);
        prevY = e.clientY;
      }
      function onMouseUp() {
        dom.unbind(window, 'mousemove', onMouseDrag);
        dom.unbind(window, 'mouseup', onMouseUp);
        onFinish();
      }
      function onMouseDown(e) {
        dom.bind(window, 'mousemove', onMouseDrag);
        dom.bind(window, 'mouseup', onMouseUp);
        prevY = e.clientY;
      }
      _this2.__input = document.createElement('input');
      _this2.__input.setAttribute('type', 'text');
      dom.bind(_this2.__input, 'change', onChange);
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__input, 'mousedown', onMouseDown);
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          _this.__truncationSuspended = true;
          this.blur();
          _this.__truncationSuspended = false;
          onFinish();
        }
      });
      _this2.updateDisplay();
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    createClass(NumberControllerBox, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
        return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerBox;
  }(NumberController);

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }
  var NumberControllerSlider = function (_NumberController) {
    inherits(NumberControllerSlider, _NumberController);
    function NumberControllerSlider(object, property, min, max, step) {
      classCallCheck(this, NumberControllerSlider);
      var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
      var _this = _this2;
      _this2.__background = document.createElement('div');
      _this2.__foreground = document.createElement('div');
      dom.bind(_this2.__background, 'mousedown', onMouseDown);
      dom.bind(_this2.__background, 'touchstart', onTouchStart);
      dom.addClass(_this2.__background, 'slider');
      dom.addClass(_this2.__foreground, 'slider-fg');
      function onMouseDown(e) {
        document.activeElement.blur();
        dom.bind(window, 'mousemove', onMouseDrag);
        dom.bind(window, 'mouseup', onMouseUp);
        onMouseDrag(e);
      }
      function onMouseDrag(e) {
        e.preventDefault();
        var bgRect = _this.__background.getBoundingClientRect();
        _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
        return false;
      }
      function onMouseUp() {
        dom.unbind(window, 'mousemove', onMouseDrag);
        dom.unbind(window, 'mouseup', onMouseUp);
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      function onTouchStart(e) {
        if (e.touches.length !== 1) {
          return;
        }
        dom.bind(window, 'touchmove', onTouchMove);
        dom.bind(window, 'touchend', onTouchEnd);
        onTouchMove(e);
      }
      function onTouchMove(e) {
        var clientX = e.touches[0].clientX;
        var bgRect = _this.__background.getBoundingClientRect();
        _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      }
      function onTouchEnd() {
        dom.unbind(window, 'touchmove', onTouchMove);
        dom.unbind(window, 'touchend', onTouchEnd);
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      _this2.updateDisplay();
      _this2.__background.appendChild(_this2.__foreground);
      _this2.domElement.appendChild(_this2.__background);
      return _this2;
    }
    createClass(NumberControllerSlider, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
        this.__foreground.style.width = pct * 100 + '%';
        return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerSlider;
  }(NumberController);

  var FunctionController = function (_Controller) {
    inherits(FunctionController, _Controller);
    function FunctionController(object, property, text) {
      classCallCheck(this, FunctionController);
      var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
      var _this = _this2;
      _this2.__button = document.createElement('div');
      _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
      dom.bind(_this2.__button, 'click', function (e) {
        e.preventDefault();
        _this.fire();
        return false;
      });
      dom.addClass(_this2.__button, 'button');
      _this2.domElement.appendChild(_this2.__button);
      return _this2;
    }
    createClass(FunctionController, [{
      key: 'fire',
      value: function fire() {
        if (this.__onChange) {
          this.__onChange.call(this);
        }
        this.getValue().call(this.object);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
      }
    }]);
    return FunctionController;
  }(Controller);

  var ColorController = function (_Controller) {
    inherits(ColorController, _Controller);
    function ColorController(object, property) {
      classCallCheck(this, ColorController);
      var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
      _this2.__color = new Color(_this2.getValue());
      _this2.__temp = new Color(0);
      var _this = _this2;
      _this2.domElement = document.createElement('div');
      dom.makeSelectable(_this2.domElement, false);
      _this2.__selector = document.createElement('div');
      _this2.__selector.className = 'selector';
      _this2.__saturation_field = document.createElement('div');
      _this2.__saturation_field.className = 'saturation-field';
      _this2.__field_knob = document.createElement('div');
      _this2.__field_knob.className = 'field-knob';
      _this2.__field_knob_border = '2px solid ';
      _this2.__hue_knob = document.createElement('div');
      _this2.__hue_knob.className = 'hue-knob';
      _this2.__hue_field = document.createElement('div');
      _this2.__hue_field.className = 'hue-field';
      _this2.__input = document.createElement('input');
      _this2.__input.type = 'text';
      _this2.__input_textShadow = '0 1px 1px ';
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          onBlur.call(this);
        }
      });
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__selector, 'mousedown', function ()        {
        dom.addClass(this, 'drag').bind(window, 'mouseup', function ()        {
          dom.removeClass(_this.__selector, 'drag');
        });
      });
      dom.bind(_this2.__selector, 'touchstart', function ()        {
        dom.addClass(this, 'drag').bind(window, 'touchend', function ()        {
          dom.removeClass(_this.__selector, 'drag');
        });
      });
      var valueField = document.createElement('div');
      Common.extend(_this2.__selector.style, {
        width: '122px',
        height: '102px',
        padding: '3px',
        backgroundColor: '#222',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
      });
      Common.extend(_this2.__field_knob.style, {
        position: 'absolute',
        width: '12px',
        height: '12px',
        border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
        boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
        borderRadius: '12px',
        zIndex: 1
      });
      Common.extend(_this2.__hue_knob.style, {
        position: 'absolute',
        width: '15px',
        height: '2px',
        borderRight: '4px solid #fff',
        zIndex: 1
      });
      Common.extend(_this2.__saturation_field.style, {
        width: '100px',
        height: '100px',
        border: '1px solid #555',
        marginRight: '3px',
        display: 'inline-block',
        cursor: 'pointer'
      });
      Common.extend(valueField.style, {
        width: '100%',
        height: '100%',
        background: 'none'
      });
      linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
      Common.extend(_this2.__hue_field.style, {
        width: '15px',
        height: '100px',
        border: '1px solid #555',
        cursor: 'ns-resize',
        position: 'absolute',
        top: '3px',
        right: '3px'
      });
      hueGradient(_this2.__hue_field);
      Common.extend(_this2.__input.style, {
        outline: 'none',
        textAlign: 'center',
        color: '#fff',
        border: 0,
        fontWeight: 'bold',
        textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
      });
      dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
      dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
      dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
      dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
      dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
      dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
      function fieldDown(e) {
        setSV(e);
        dom.bind(window, 'mousemove', setSV);
        dom.bind(window, 'touchmove', setSV);
        dom.bind(window, 'mouseup', fieldUpSV);
        dom.bind(window, 'touchend', fieldUpSV);
      }
      function fieldDownH(e) {
        setH(e);
        dom.bind(window, 'mousemove', setH);
        dom.bind(window, 'touchmove', setH);
        dom.bind(window, 'mouseup', fieldUpH);
        dom.bind(window, 'touchend', fieldUpH);
      }
      function fieldUpSV() {
        dom.unbind(window, 'mousemove', setSV);
        dom.unbind(window, 'touchmove', setSV);
        dom.unbind(window, 'mouseup', fieldUpSV);
        dom.unbind(window, 'touchend', fieldUpSV);
        onFinish();
      }
      function fieldUpH() {
        dom.unbind(window, 'mousemove', setH);
        dom.unbind(window, 'touchmove', setH);
        dom.unbind(window, 'mouseup', fieldUpH);
        dom.unbind(window, 'touchend', fieldUpH);
        onFinish();
      }
      function onBlur() {
        var i = interpret(this.value);
        if (i !== false) {
          _this.__color.__state = i;
          _this.setValue(_this.__color.toOriginal());
        } else {
          this.value = _this.__color.toString();
        }
      }
      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.__color.toOriginal());
        }
      }
      _this2.__saturation_field.appendChild(valueField);
      _this2.__selector.appendChild(_this2.__field_knob);
      _this2.__selector.appendChild(_this2.__saturation_field);
      _this2.__selector.appendChild(_this2.__hue_field);
      _this2.__hue_field.appendChild(_this2.__hue_knob);
      _this2.domElement.appendChild(_this2.__input);
      _this2.domElement.appendChild(_this2.__selector);
      _this2.updateDisplay();
      function setSV(e) {
        if (e.type.indexOf('touch') === -1) {
          e.preventDefault();
        }
        var fieldRect = _this.__saturation_field.getBoundingClientRect();
        var _ref = e.touches && e.touches[0] || e,
            clientX = _ref.clientX,
            clientY = _ref.clientY;
        var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
        var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
        if (v > 1) {
          v = 1;
        } else if (v < 0) {
          v = 0;
        }
        if (s > 1) {
          s = 1;
        } else if (s < 0) {
          s = 0;
        }
        _this.__color.v = v;
        _this.__color.s = s;
        _this.setValue(_this.__color.toOriginal());
        return false;
      }
      function setH(e) {
        if (e.type.indexOf('touch') === -1) {
          e.preventDefault();
        }
        var fieldRect = _this.__hue_field.getBoundingClientRect();
        var _ref2 = e.touches && e.touches[0] || e,
            clientY = _ref2.clientY;
        var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
        if (h > 1) {
          h = 1;
        } else if (h < 0) {
          h = 0;
        }
        _this.__color.h = h * 360;
        _this.setValue(_this.__color.toOriginal());
        return false;
      }
      return _this2;
    }
    createClass(ColorController, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        var i = interpret(this.getValue());
        if (i !== false) {
          var mismatch = false;
          Common.each(Color.COMPONENTS, function (component) {
            if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
              mismatch = true;
              return {};
            }
          }, this);
          if (mismatch) {
            Common.extend(this.__color.__state, i);
          }
        }
        Common.extend(this.__temp.__state, this.__color.__state);
        this.__temp.a = 1;
        var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
        var _flip = 255 - flip;
        Common.extend(this.__field_knob.style, {
          marginLeft: 100 * this.__color.s - 7 + 'px',
          marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
          backgroundColor: this.__temp.toHexString(),
          border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
        });
        this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
        this.__temp.s = 1;
        this.__temp.v = 1;
        linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
        this.__input.value = this.__color.toString();
        Common.extend(this.__input.style, {
          backgroundColor: this.__color.toHexString(),
          color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
          textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
        });
      }
    }]);
    return ColorController;
  }(Controller);
  var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
  function linearGradient(elem, x, a, b) {
    elem.style.background = '';
    Common.each(vendors, function (vendor) {
      elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
    });
  }
  function hueGradient(elem) {
    elem.style.background = '';
    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  }

  var css = {
    load: function load(url, indoc) {
      var doc = indoc || document;
      var link = doc.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      doc.getElementsByTagName('head')[0].appendChild(link);
    },
    inject: function inject(cssContent, indoc) {
      var doc = indoc || document;
      var injected = document.createElement('style');
      injected.type = 'text/css';
      injected.innerHTML = cssContent;
      var head = doc.getElementsByTagName('head')[0];
      try {
        head.appendChild(injected);
      } catch (e) {
      }
    }
  };

  var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

  var ControllerFactory = function ControllerFactory(object, property) {
    var initialValue = object[property];
    if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
      return new OptionController(object, property, arguments[2]);
    }
    if (Common.isNumber(initialValue)) {
      if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
        if (Common.isNumber(arguments[4])) {
          return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
        }
        return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
      }
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
      }
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
    }
    if (Common.isString(initialValue)) {
      return new StringController(object, property);
    }
    if (Common.isFunction(initialValue)) {
      return new FunctionController(object, property, '');
    }
    if (Common.isBoolean(initialValue)) {
      return new BooleanController(object, property);
    }
    return null;
  };

  function requestAnimationFrame$1(callback) {
    setTimeout(callback, 1000 / 60);
  }
  var requestAnimationFrame$1$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame$1;

  var CenteredDiv = function () {
    function CenteredDiv() {
      classCallCheck(this, CenteredDiv);
      this.backgroundElement = document.createElement('div');
      Common.extend(this.backgroundElement.style, {
        backgroundColor: 'rgba(0,0,0,0.8)',
        top: 0,
        left: 0,
        display: 'none',
        zIndex: '1000',
        opacity: 0,
        WebkitTransition: 'opacity 0.2s linear',
        transition: 'opacity 0.2s linear'
      });
      dom.makeFullscreen(this.backgroundElement);
      this.backgroundElement.style.position = 'fixed';
      this.domElement = document.createElement('div');
      Common.extend(this.domElement.style, {
        position: 'fixed',
        display: 'none',
        zIndex: '1001',
        opacity: 0,
        WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
        transition: 'transform 0.2s ease-out, opacity 0.2s linear'
      });
      document.body.appendChild(this.backgroundElement);
      document.body.appendChild(this.domElement);
      var _this = this;
      dom.bind(this.backgroundElement, 'click', function () {
        _this.hide();
      });
    }
    createClass(CenteredDiv, [{
      key: 'show',
      value: function show() {
        var _this = this;
        this.backgroundElement.style.display = 'block';
        this.domElement.style.display = 'block';
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = 'scale(1.1)';
        this.layout();
        Common.defer(function () {
          _this.backgroundElement.style.opacity = 1;
          _this.domElement.style.opacity = 1;
          _this.domElement.style.webkitTransform = 'scale(1)';
        });
      }
    }, {
      key: 'hide',
      value: function hide() {
        var _this = this;
        var hide = function hide() {
          _this.domElement.style.display = 'none';
          _this.backgroundElement.style.display = 'none';
          dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
          dom.unbind(_this.domElement, 'transitionend', hide);
          dom.unbind(_this.domElement, 'oTransitionEnd', hide);
        };
        dom.bind(this.domElement, 'webkitTransitionEnd', hide);
        dom.bind(this.domElement, 'transitionend', hide);
        dom.bind(this.domElement, 'oTransitionEnd', hide);
        this.backgroundElement.style.opacity = 0;
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = 'scale(1.1)';
      }
    }, {
      key: 'layout',
      value: function layout() {
        this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
        this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
      }
    }]);
    return CenteredDiv;
  }();

  var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

  css.inject(styleSheet);
  var CSS_NAMESPACE = 'dg';
  var HIDE_KEY_CODE = 72;
  var CLOSE_BUTTON_HEIGHT = 20;
  var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
  var SUPPORTS_LOCAL_STORAGE = function () {
    try {
      return !!window.localStorage;
    } catch (e) {
      return false;
    }
  }();
  var SAVE_DIALOGUE = void 0;
  var autoPlaceVirgin = true;
  var autoPlaceContainer = void 0;
  var hide = false;
  var hideableGuis = [];
  var GUI = function GUI(pars) {
    var _this = this;
    var params = pars || {};
    this.domElement = document.createElement('div');
    this.__ul = document.createElement('ul');
    this.domElement.appendChild(this.__ul);
    dom.addClass(this.domElement, CSS_NAMESPACE);
    this.__folders = {};
    this.__controllers = [];
    this.__rememberedObjects = [];
    this.__rememberedObjectIndecesToControllers = [];
    this.__listening = [];
    params = Common.defaults(params, {
      closeOnTop: false,
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH
    });
    params = Common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace
    });
    if (!Common.isUndefined(params.load)) {
      if (params.preset) {
        params.load.preset = params.preset;
      }
    } else {
      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
    }
    if (Common.isUndefined(params.parent) && params.hideable) {
      hideableGuis.push(this);
    }
    params.resizable = Common.isUndefined(params.parent) && params.resizable;
    if (params.autoPlace && Common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
    var saveToLocalStorage = void 0;
    var titleRow = void 0;
    Object.defineProperties(this,
    {
      parent: {
        get: function get$$1() {
          return params.parent;
        }
      },
      scrollable: {
        get: function get$$1() {
          return params.scrollable;
        }
      },
      autoPlace: {
        get: function get$$1() {
          return params.autoPlace;
        }
      },
      closeOnTop: {
        get: function get$$1() {
          return params.closeOnTop;
        }
      },
      preset: {
        get: function get$$1() {
          if (_this.parent) {
            return _this.getRoot().preset;
          }
          return params.load.preset;
        },
        set: function set$$1(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }
          setPresetSelectIndex(this);
          _this.revert();
        }
      },
      width: {
        get: function get$$1() {
          return params.width;
        },
        set: function set$$1(v) {
          params.width = v;
          setWidth(_this, v);
        }
      },
      name: {
        get: function get$$1() {
          return params.name;
        },
        set: function set$$1(v) {
          params.name = v;
          if (titleRow) {
            titleRow.innerHTML = params.name;
          }
        }
      },
      closed: {
        get: function get$$1() {
          return params.closed;
        },
        set: function set$$1(v) {
          params.closed = v;
          if (params.closed) {
            dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
          }
          this.onResize();
          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
          }
        }
      },
      load: {
        get: function get$$1() {
          return params.load;
        }
      },
      useLocalStorage: {
        get: function get$$1() {
          return useLocalStorage;
        },
        set: function set$$1(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            useLocalStorage = bool;
            if (bool) {
              dom.bind(window, 'unload', saveToLocalStorage);
            } else {
              dom.unbind(window, 'unload', saveToLocalStorage);
            }
            localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
          }
        }
      }
    });
    if (Common.isUndefined(params.parent)) {
      this.closed = params.closed || false;
      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);
      if (SUPPORTS_LOCAL_STORAGE) {
        if (useLocalStorage) {
          _this.useLocalStorage = true;
          var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
          if (savedGui) {
            params.load = JSON.parse(savedGui);
          }
        }
      }
      this.__closeButton = document.createElement('div');
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      if (params.closeOnTop) {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
        this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
      } else {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
        this.domElement.appendChild(this.__closeButton);
      }
      dom.bind(this.__closeButton, 'click', function () {
        _this.closed = !_this.closed;
      });
    } else {
      if (params.closed === undefined) {
        params.closed = true;
      }
      var titleRowName = document.createTextNode(params.name);
      dom.addClass(titleRowName, 'controller-name');
      titleRow = addRow(_this, titleRowName);
      var onClickTitle = function onClickTitle(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };
      dom.addClass(this.__ul, GUI.CLASS_CLOSED);
      dom.addClass(titleRow, 'title');
      dom.bind(titleRow, 'click', onClickTitle);
      if (!params.closed) {
        this.closed = false;
      }
    }
    if (params.autoPlace) {
      if (Common.isUndefined(params.parent)) {
        if (autoPlaceVirgin) {
          autoPlaceContainer = document.createElement('div');
          dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
          dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(autoPlaceContainer);
          autoPlaceVirgin = false;
        }
        autoPlaceContainer.appendChild(this.domElement);
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }
      if (!this.parent) {
        setWidth(_this, params.width);
      }
    }
    this.__resizeHandler = function () {
      _this.onResizeDebounced();
    };
    dom.bind(window, 'resize', this.__resizeHandler);
    dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
    dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
    dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
    this.onResize();
    if (params.resizable) {
      addResizeHandle(this);
    }
    saveToLocalStorage = function saveToLocalStorage() {
      if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
        localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
      }
    };
    this.saveToLocalStorageIfPossible = saveToLocalStorage;
    function resetWidth() {
      var root = _this.getRoot();
      root.width += 1;
      Common.defer(function () {
        root.width -= 1;
      });
    }
    if (!params.parent) {
      resetWidth();
    }
  };
  GUI.toggleHide = function () {
    hide = !hide;
    Common.each(hideableGuis, function (gui) {
      gui.domElement.style.display = hide ? 'none' : '';
    });
  };
  GUI.CLASS_AUTO_PLACE = 'a';
  GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
  GUI.CLASS_MAIN = 'main';
  GUI.CLASS_CONTROLLER_ROW = 'cr';
  GUI.CLASS_TOO_TALL = 'taller-than-window';
  GUI.CLASS_CLOSED = 'closed';
  GUI.CLASS_CLOSE_BUTTON = 'close-button';
  GUI.CLASS_CLOSE_TOP = 'close-top';
  GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
  GUI.CLASS_DRAG = 'drag';
  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = 'Close Controls';
  GUI.TEXT_OPEN = 'Open Controls';
  GUI._keydownHandler = function (e) {
    if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }
  };
  dom.bind(window, 'keydown', GUI._keydownHandler, false);
  Common.extend(GUI.prototype,
  {
    add: function add(object, property) {
      return _add(this, object, property, {
        factoryArgs: Array.prototype.slice.call(arguments, 2)
      });
    },
    addColor: function addColor(object, property) {
      return _add(this, object, property, {
        color: true
      });
    },
    remove: function remove(controller) {
      this.__ul.removeChild(controller.__li);
      this.__controllers.splice(this.__controllers.indexOf(controller), 1);
      var _this = this;
      Common.defer(function () {
        _this.onResize();
      });
    },
    destroy: function destroy() {
      if (this.parent) {
        throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
      }
      if (this.autoPlace) {
        autoPlaceContainer.removeChild(this.domElement);
      }
      var _this = this;
      Common.each(this.__folders, function (subfolder) {
        _this.removeFolder(subfolder);
      });
      dom.unbind(window, 'keydown', GUI._keydownHandler, false);
      removeListeners(this);
    },
    addFolder: function addFolder(name) {
      if (this.__folders[name] !== undefined) {
        throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
      }
      var newGuiParams = { name: name, parent: this };
      newGuiParams.autoPlace = this.autoPlace;
      if (this.load &&
      this.load.folders &&
      this.load.folders[name]) {
        newGuiParams.closed = this.load.folders[name].closed;
        newGuiParams.load = this.load.folders[name];
      }
      var gui = new GUI(newGuiParams);
      this.__folders[name] = gui;
      var li = addRow(this, gui.domElement);
      dom.addClass(li, 'folder');
      return gui;
    },
    removeFolder: function removeFolder(folder) {
      this.__ul.removeChild(folder.domElement.parentElement);
      delete this.__folders[folder.name];
      if (this.load &&
      this.load.folders &&
      this.load.folders[folder.name]) {
        delete this.load.folders[folder.name];
      }
      removeListeners(folder);
      var _this = this;
      Common.each(folder.__folders, function (subfolder) {
        folder.removeFolder(subfolder);
      });
      Common.defer(function () {
        _this.onResize();
      });
    },
    open: function open() {
      this.closed = false;
    },
    close: function close() {
      this.closed = true;
    },
    hide: function hide() {
      this.domElement.style.display = 'none';
    },
    show: function show() {
      this.domElement.style.display = '';
    },
    onResize: function onResize() {
      var root = this.getRoot();
      if (root.scrollable) {
        var top = dom.getOffset(root.__ul).top;
        var h = 0;
        Common.each(root.__ul.childNodes, function (node) {
          if (!(root.autoPlace && node === root.__save_row)) {
            h += dom.getHeight(node);
          }
        });
        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
        } else {
          dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = 'auto';
        }
      }
      if (root.__resize_handle) {
        Common.defer(function () {
          root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
        });
      }
      if (root.__closeButton) {
        root.__closeButton.style.width = root.width + 'px';
      }
    },
    onResizeDebounced: Common.debounce(function () {
      this.onResize();
    }, 50),
    remember: function remember() {
      if (Common.isUndefined(SAVE_DIALOGUE)) {
        SAVE_DIALOGUE = new CenteredDiv();
        SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
      }
      if (this.parent) {
        throw new Error('You can only call remember on a top level GUI.');
      }
      var _this = this;
      Common.each(Array.prototype.slice.call(arguments), function (object) {
        if (_this.__rememberedObjects.length === 0) {
          addSaveMenu(_this);
        }
        if (_this.__rememberedObjects.indexOf(object) === -1) {
          _this.__rememberedObjects.push(object);
        }
      });
      if (this.autoPlace) {
        setWidth(this, this.width);
      }
    },
    getRoot: function getRoot() {
      var gui = this;
      while (gui.parent) {
        gui = gui.parent;
      }
      return gui;
    },
    getSaveObject: function getSaveObject() {
      var toReturn = this.load;
      toReturn.closed = this.closed;
      if (this.__rememberedObjects.length > 0) {
        toReturn.preset = this.preset;
        if (!toReturn.remembered) {
          toReturn.remembered = {};
        }
        toReturn.remembered[this.preset] = getCurrentPreset(this);
      }
      toReturn.folders = {};
      Common.each(this.__folders, function (element, key) {
        toReturn.folders[key] = element.getSaveObject();
      });
      return toReturn;
    },
    save: function save() {
      if (!this.load.remembered) {
        this.load.remembered = {};
      }
      this.load.remembered[this.preset] = getCurrentPreset(this);
      markPresetModified(this, false);
      this.saveToLocalStorageIfPossible();
    },
    saveAs: function saveAs(presetName) {
      if (!this.load.remembered) {
        this.load.remembered = {};
        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
      }
      this.load.remembered[presetName] = getCurrentPreset(this);
      this.preset = presetName;
      addPresetOption(this, presetName, true);
      this.saveToLocalStorageIfPossible();
    },
    revert: function revert(gui) {
      Common.each(this.__controllers, function (controller) {
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue);
        } else {
          recallSavedValue(gui || this.getRoot(), controller);
        }
        if (controller.__onFinishChange) {
          controller.__onFinishChange.call(controller, controller.getValue());
        }
      }, this);
      Common.each(this.__folders, function (folder) {
        folder.revert(folder);
      });
      if (!gui) {
        markPresetModified(this.getRoot(), false);
      }
    },
    listen: function listen(controller) {
      var init = this.__listening.length === 0;
      this.__listening.push(controller);
      if (init) {
        updateDisplays(this.__listening);
      }
    },
    updateDisplay: function updateDisplay() {
      Common.each(this.__controllers, function (controller) {
        controller.updateDisplay();
      });
      Common.each(this.__folders, function (folder) {
        folder.updateDisplay();
      });
    }
  });
  function addRow(gui, newDom, liBefore) {
    var li = document.createElement('li');
    if (newDom) {
      li.appendChild(newDom);
    }
    if (liBefore) {
      gui.__ul.insertBefore(li, liBefore);
    } else {
      gui.__ul.appendChild(li);
    }
    gui.onResize();
    return li;
  }
  function removeListeners(gui) {
    dom.unbind(window, 'resize', gui.__resizeHandler);
    if (gui.saveToLocalStorageIfPossible) {
      dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
    }
  }
  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
    if (modified) {
      opt.innerHTML = opt.value + '*';
    } else {
      opt.innerHTML = opt.value;
    }
  }
  function augmentController(gui, li, controller) {
    controller.__li = li;
    controller.__gui = gui;
    Common.extend(controller,                                   {
      options: function options(_options) {
        if (arguments.length > 1) {
          var nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: nextSibling,
            factoryArgs: [Common.toArray(arguments)]
          });
        }
        if (Common.isArray(_options) || Common.isObject(_options)) {
          var _nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: _nextSibling,
            factoryArgs: [_options]
          });
        }
      },
      name: function name(_name) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
        return controller;
      },
      listen: function listen() {
        controller.__gui.listen(controller);
        return controller;
      },
      remove: function remove() {
        controller.__gui.remove(controller);
        return controller;
      }
    });
    if (controller instanceof NumberControllerSlider) {
      var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
      Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function () {
          var args = Array.prototype.slice.call(arguments);
          pb.apply(box, args);
          return pc.apply(controller, args);
        };
      });
      dom.addClass(li, 'has-slider');
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {
      var r = function r(returned) {
        if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
          var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
          var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
          controller.remove();
          var newController = _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [controller.__min, controller.__max, controller.__step]
          });
          newController.name(oldName);
          if (wasListening) newController.listen();
          return newController;
        }
        return returned;
      };
      controller.min = Common.compose(r, controller.min);
      controller.max = Common.compose(r, controller.max);
    } else if (controller instanceof BooleanController) {
      dom.bind(li, 'click', function () {
        dom.fakeEvent(controller.__checkbox, 'click');
      });
      dom.bind(controller.__checkbox, 'click', function (e) {
        e.stopPropagation();
      });
    } else if (controller instanceof FunctionController) {
      dom.bind(li, 'click', function () {
        dom.fakeEvent(controller.__button, 'click');
      });
      dom.bind(li, 'mouseover', function () {
        dom.addClass(controller.__button, 'hover');
      });
      dom.bind(li, 'mouseout', function () {
        dom.removeClass(controller.__button, 'hover');
      });
    } else if (controller instanceof ColorController) {
      dom.addClass(li, 'color');
      controller.updateDisplay = Common.compose(function (val) {
        li.style.borderLeftColor = controller.__color.toString();
        return val;
      }, controller.updateDisplay);
      controller.updateDisplay();
    }
    controller.setValue = Common.compose(function (val) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return val;
    }, controller.setValue);
  }
  function recallSavedValue(gui, controller) {
    var root = gui.getRoot();
    var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
    if (matchedIndex !== -1) {
      var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
      if (controllerMap === undefined) {
        controllerMap = {};
        root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
      }
      controllerMap[controller.property] = controller;
      if (root.load && root.load.remembered) {
        var presetMap = root.load.remembered;
        var preset = void 0;
        if (presetMap[gui.preset]) {
          preset = presetMap[gui.preset];
        } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
          preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
        } else {
          return;
        }
        if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
          var value = preset[matchedIndex][controller.property];
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }
  function _add(gui, object, property, params) {
    if (object[property] === undefined) {
      throw new Error('Object "' + object + '" has no property "' + property + '"');
    }
    var controller = void 0;
    if (params.color) {
      controller = new ColorController(object, property);
    } else {
      var factoryArgs = [object, property].concat(params.factoryArgs);
      controller = ControllerFactory.apply(gui, factoryArgs);
    }
    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }
    recallSavedValue(gui, controller);
    dom.addClass(controller.domElement, 'c');
    var name = document.createElement('span');
    dom.addClass(name, 'property-name');
    name.innerHTML = controller.property;
    var container = document.createElement('div');
    container.appendChild(name);
    container.appendChild(controller.domElement);
    var li = addRow(gui, container, params.before);
    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    if (controller instanceof ColorController) {
      dom.addClass(li, 'color');
    } else {
      dom.addClass(li, _typeof(controller.getValue()));
    }
    augmentController(gui, li, controller);
    gui.__controllers.push(controller);
    return controller;
  }
  function getLocalStorageHash(gui, key) {
    return document.location.href + '.' + key;
  }
  function addPresetOption(gui, name, setSelected) {
    var opt = document.createElement('option');
    opt.innerHTML = name;
    opt.value = name;
    gui.__preset_select.appendChild(opt);
    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }
  function showHideExplain(gui, explain) {
    explain.style.display = gui.useLocalStorage ? 'block' : 'none';
  }
  function addSaveMenu(gui) {
    var div = gui.__save_row = document.createElement('li');
    dom.addClass(gui.domElement, 'has-save');
    gui.__ul.insertBefore(div, gui.__ul.firstChild);
    dom.addClass(div, 'save-row');
    var gears = document.createElement('span');
    gears.innerHTML = '&nbsp;';
    dom.addClass(gears, 'button gears');
    var button = document.createElement('span');
    button.innerHTML = 'Save';
    dom.addClass(button, 'button');
    dom.addClass(button, 'save');
    var button2 = document.createElement('span');
    button2.innerHTML = 'New';
    dom.addClass(button2, 'button');
    dom.addClass(button2, 'save-as');
    var button3 = document.createElement('span');
    button3.innerHTML = 'Revert';
    dom.addClass(button3, 'button');
    dom.addClass(button3, 'revert');
    var select = gui.__preset_select = document.createElement('select');
    if (gui.load && gui.load.remembered) {
      Common.each(gui.load.remembered, function (value, key) {
        addPresetOption(gui, key, key === gui.preset);
      });
    } else {
      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
    }
    dom.bind(select, 'change', function () {
      for (var index = 0; index < gui.__preset_select.length; index++) {
        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
      }
      gui.preset = this.value;
    });
    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);
    if (SUPPORTS_LOCAL_STORAGE) {
      var explain = document.getElementById('dg-local-explain');
      var localStorageCheckBox = document.getElementById('dg-local-storage');
      var saveLocally = document.getElementById('dg-save-locally');
      saveLocally.style.display = 'block';
      if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
        localStorageCheckBox.setAttribute('checked', 'checked');
      }
      showHideExplain(gui, explain);
      dom.bind(localStorageCheckBox, 'change', function () {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain(gui, explain);
      });
    }
    var newConstructorTextArea = document.getElementById('dg-new-constructor');
    dom.bind(newConstructorTextArea, 'keydown', function (e) {
      if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
        SAVE_DIALOGUE.hide();
      }
    });
    dom.bind(gears, 'click', function () {
      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });
    dom.bind(button, 'click', function () {
      gui.save();
    });
    dom.bind(button2, 'click', function () {
      var presetName = prompt('Enter a new preset name.');
      if (presetName) {
        gui.saveAs(presetName);
      }
    });
    dom.bind(button3, 'click', function () {
      gui.revert();
    });
  }
  function addResizeHandle(gui) {
    var pmouseX = void 0;
    gui.__resize_handle = document.createElement('div');
    Common.extend(gui.__resize_handle.style, {
      width: '6px',
      marginLeft: '-3px',
      height: '200px',
      cursor: 'ew-resize',
      position: 'absolute'
    });
    function drag(e) {
      e.preventDefault();
      gui.width += pmouseX - e.clientX;
      gui.onResize();
      pmouseX = e.clientX;
      return false;
    }
    function dragStop() {
      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, 'mousemove', drag);
      dom.unbind(window, 'mouseup', dragStop);
    }
    function dragStart(e) {
      e.preventDefault();
      pmouseX = e.clientX;
      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, 'mousemove', drag);
      dom.bind(window, 'mouseup', dragStop);
      return false;
    }
    dom.bind(gui.__resize_handle, 'mousedown', dragStart);
    dom.bind(gui.__closeButton, 'mousedown', dragStart);
    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
  }
  function setWidth(gui, w) {
    gui.domElement.style.width = w + 'px';
    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + 'px';
    }
    if (gui.__closeButton) {
      gui.__closeButton.style.width = w + 'px';
    }
  }
  function getCurrentPreset(gui, useInitialValues) {
    var toReturn = {};
    Common.each(gui.__rememberedObjects, function (val, index) {
      var savedValues = {};
      var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
      Common.each(controllerMap, function (controller, property) {
        savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });
      toReturn[index] = savedValues;
    });
    return toReturn;
  }
  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value === gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }
  function updateDisplays(controllerArray) {
    if (controllerArray.length !== 0) {
      requestAnimationFrame$1$1.call(window, function () {
        updateDisplays(controllerArray);
      });
    }
    Common.each(controllerArray, function (c) {
      c.updateDisplay();
    });
  }
  var GUI$1 = GUI;

  /**
   * Copyright 2014 Google Inc. All rights reserved.
   *
   * Use of this source code is governed by a BSD-style
   * license that can be found in the LICENSE file.
   *
   * @fileoverview Description of this file.
   *
   * A polyfill for HTML Canvas features, including
   * Path2D support.
   */

  (function (CanvasRenderingContext2D, nodeRequire) {

  if (CanvasRenderingContext2D == undefined) {
    CanvasRenderingContext2D = nodeRequire('canvas').Context2d;
  }

  if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
    CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
      this.save();
      this.translate(x, y);
      this.rotate(rotation);
      this.scale(radiusX, radiusY);
      this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
      this.restore();
    };
  }

  if (typeof Path2D !== 'function' || 
      typeof new Path2D().addPath !== 'function') {
    (function() {

      // Include the SVG path parser.
      var parser = (function() {
        /*
         * Generated by PEG.js 0.8.0.
         *
         * http://pegjs.majda.cz/
         */
      
        function peg$subclass(child, parent) {
          function ctor() { this.constructor = child; }
          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
        }
      
        function SyntaxError(message, expected, found, offset, line, column) {
          this.message  = message;
          this.expected = expected;
          this.found    = found;
          this.offset   = offset;
          this.line     = line;
          this.column   = column;
      
          this.name     = "SyntaxError";
        }
      
        peg$subclass(SyntaxError, Error);
      
        function parse(input) {
          var options = arguments.length > 1 ? arguments[1] : {},
      
              peg$FAILED = {},
      
              peg$startRuleFunctions = { svg_path: peg$parsesvg_path },
              peg$startRuleFunction  = peg$parsesvg_path,
      
              peg$c0 = peg$FAILED,
              peg$c2 = null,
              peg$c3 = function(d) { return ops; },
              peg$c4 = /^[Mm]/,
              peg$c5 = { type: "class", value: "[Mm]", description: "[Mm]" },
              peg$c6 = function(ch, args) {
                    var moveCh = ch;
                    // If this is the first move cmd then force it to be absolute.
                    if (firstSubPath) {
                      moveCh = 'M';
                      firstSubPath = false;
                    }
                    ops.push({type: 'moveTo', args: makeAbsolute(moveCh, args[0])});
                    for (var i=1; i < args.length; i++) {
                      // The lineTo args are either abs or relative, depending on the
                      // original moveto command.
                      ops.push({type: 'lineTo', args: makeAbsolute(ch, args[i])});
                    }
                  },
              peg$c7 = function(one, rest) { return concatSequence(one, rest); },
              peg$c8 = /^[Zz]/,
              peg$c9 = { type: "class", value: "[Zz]", description: "[Zz]" },
              peg$c10 = function() { ops.push({type: 'closePath', args: []}); },
              peg$c11 = /^[Ll]/,
              peg$c12 = { type: "class", value: "[Ll]", description: "[Ll]" },
              peg$c13 = function(ch, args) {
                    for (var i=0; i < args.length; i++) {
                      ops.push({type: 'lineTo', args: makeAbsolute(ch, args[i])});
                    }
                  },
              peg$c14 = /^[Hh]/,
              peg$c15 = { type: "class", value: "[Hh]", description: "[Hh]" },
              peg$c16 = function(ch, args) {
                  for (var i=0; i < args.length; i++) {
                    ops.push({type: 'lineTo', args: makeAbsoluteFromX(ch, args[i])});
                  }
                },
              peg$c17 = /^[Vv]/,
              peg$c18 = { type: "class", value: "[Vv]", description: "[Vv]" },
              peg$c19 = function(ch, args) {
                  for (var i=0; i < args.length; i++) {
                    ops.push({type: 'lineTo', args: makeAbsoluteFromY(ch, args[i])});
                  }
                },
              peg$c20 = /^[Cc]/,
              peg$c21 = { type: "class", value: "[Cc]", description: "[Cc]" },
              peg$c22 = function(ch, args) {
                  for (var i=0; i < args.length; i++) {
                    ops.push({type: 'bezierCurveTo', args: makeAbsoluteMultiple(ch, args[i])});
                  }
                },
              peg$c23 = function(cp1, cp2, last) { return cp1.concat(cp2, last); },
              peg$c24 = /^[Ss]/,
              peg$c25 = { type: "class", value: "[Ss]", description: "[Ss]" },
              peg$c26 = function(ch, args) {
                  for (var i=0; i < args.length; i++) {
                    ops.push({type: 'bezierCurveTo', args: makeReflected().concat(makeAbsoluteMultiple(ch, args[i]))});
                  }
                },
              peg$c27 = function(cp1, last) { return cp1.concat(last); },
              peg$c28 = /^[Qq]/,
              peg$c29 = { type: "class", value: "[Qq]", description: "[Qq]" },
              peg$c30 = function(ch, args) {
                  for (var i=0; i < args.length; i++) {
                    ops.push({type: 'quadraticCurveTo', args: makeAbsoluteMultiple(ch, args[i])});
                  }
                },
              peg$c31 = /^[Tt]/,
              peg$c32 = { type: "class", value: "[Tt]", description: "[Tt]" },
              peg$c33 = function(ch, args) {
                  for (var i=0; i < args.length; i++) {
                    var reflected = makeReflected();
                    ops.push({type: 'quadraticCurveTo', args: reflected.concat(makeAbsoluteMultiple(ch, args[i]))});
                    lastControl = reflected.slice(0);
                  }
                },
              peg$c34 = /^[Aa]/,
              peg$c35 = { type: "class", value: "[Aa]", description: "[Aa]" },
              peg$c36 = function(ch, args) {
                  for (var i=0; i < args.length; i++) {
                    var x1 = [lastCoord.slice()];
                    var x2 = [makeAbsolute(ch, args[i].slice(-2))];
                    absArgs = x1.concat(args[i].slice(0, -2), x2);
                    ellipseFromEllipticalArc.apply(this, absArgs);
                  }
                },
              peg$c37 = function(rx, ry, xrot, large, sweep, last) { return [parseFloat(rx), parseFloat(ry), parseFloat(flatten(xrot).join('')), parseInt(large), parseInt(sweep), last[0], last[1]]; },
              peg$c38 = function(x, y) { return [x, y] },
              peg$c39 = function(number) { return parseFloat(flatten(number).join('')) },
              peg$c40 = "0",
              peg$c41 = { type: "literal", value: "0", description: "\"0\"" },
              peg$c42 = "1",
              peg$c43 = { type: "literal", value: "1", description: "\"1\"" },
              peg$c44 = ",",
              peg$c45 = { type: "literal", value: ",", description: "\",\"" },
              peg$c46 = ".",
              peg$c47 = { type: "literal", value: ".", description: "\".\"" },
              peg$c48 = /^[eE]/,
              peg$c49 = { type: "class", value: "[eE]", description: "[eE]" },
              peg$c50 = "+",
              peg$c51 = { type: "literal", value: "+", description: "\"+\"" },
              peg$c52 = "-",
              peg$c53 = { type: "literal", value: "-", description: "\"-\"" },
              peg$c54 = /^[0-9]/,
              peg$c55 = { type: "class", value: "[0-9]", description: "[0-9]" },
              peg$c56 = function(digits) { return digits.join('') },
              peg$c57 = /^[ \t\n\r]/,
              peg$c58 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
      
              peg$currPos          = 0,
              peg$cachedPos        = 0,
              peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
              peg$maxFailPos       = 0,
              peg$maxFailExpected  = [],
              peg$result;
      
          if ("startRule" in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
              throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }
      
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
          }
      
          function peg$computePosDetails(pos) {
            function advance(details, startPos, endPos) {
              var p, ch;
      
              for (p = startPos; p < endPos; p++) {
                ch = input.charAt(p);
                if (ch === "\n") {
                  if (!details.seenCR) { details.line++; }
                  details.column = 1;
                  details.seenCR = false;
                } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
                  details.line++;
                  details.column = 1;
                  details.seenCR = true;
                } else {
                  details.column++;
                  details.seenCR = false;
                }
              }
            }
      
            if (peg$cachedPos !== pos) {
              if (peg$cachedPos > pos) {
                peg$cachedPos = 0;
                peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
              }
              advance(peg$cachedPosDetails, peg$cachedPos, pos);
              peg$cachedPos = pos;
            }
      
            return peg$cachedPosDetails;
          }
      
          function peg$fail(expected) {
            if (peg$currPos < peg$maxFailPos) { return; }
      
            if (peg$currPos > peg$maxFailPos) {
              peg$maxFailPos = peg$currPos;
              peg$maxFailExpected = [];
            }
      
            peg$maxFailExpected.push(expected);
          }
      
          function peg$buildException(message, expected, pos) {
            function cleanupExpected(expected) {
              var i = 1;
      
              expected.sort(function(a, b) {
                if (a.description < b.description) {
                  return -1;
                } else if (a.description > b.description) {
                  return 1;
                } else {
                  return 0;
                }
              });
      
              while (i < expected.length) {
                if (expected[i - 1] === expected[i]) {
                  expected.splice(i, 1);
                } else {
                  i++;
                }
              }
            }
      
            function buildMessage(expected, found) {
              function stringEscape(s) {
                function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }
      
                return s
                  .replace(/\\/g,   '\\\\')
                  .replace(/"/g,    '\\"')
                  .replace(/\x08/g, '\\b')
                  .replace(/\t/g,   '\\t')
                  .replace(/\n/g,   '\\n')
                  .replace(/\f/g,   '\\f')
                  .replace(/\r/g,   '\\r')
                  .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
                  .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
                  .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
                  .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
              }
      
              var expectedDescs = new Array(expected.length),
                  expectedDesc, foundDesc, i;
      
              for (i = 0; i < expected.length; i++) {
                expectedDescs[i] = expected[i].description;
              }
      
              expectedDesc = expected.length > 1
                ? expectedDescs.slice(0, -1).join(", ")
                    + " or "
                    + expectedDescs[expected.length - 1]
                : expectedDescs[0];
      
              foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
      
              return "Expected " + expectedDesc + " but " + foundDesc + " found.";
            }
      
            var posDetails = peg$computePosDetails(pos),
                found      = pos < input.length ? input.charAt(pos) : null;
      
            if (expected !== null) {
              cleanupExpected(expected);
            }
      
            return new SyntaxError(
              message !== null ? message : buildMessage(expected, found),
              expected,
              found,
              pos,
              posDetails.line,
              posDetails.column
            );
          }
      
          function peg$parsesvg_path() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsewsp();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parsewsp();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsemoveTo_drawTo_commandGroups();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsewsp();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parsewsp();
                }
                if (s3 !== peg$FAILED) {
                  s1 = peg$c3(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemoveTo_drawTo_commandGroups() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsemoveTo_drawTo_commandGroup();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = [];
              s4 = peg$parsewsp();
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parsewsp();
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsemoveTo_drawTo_commandGroups();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemoveTo_drawTo_commandGroup() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsemoveto();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = [];
              s4 = peg$parsewsp();
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parsewsp();
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsedrawto_commands();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedrawto_commands() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsedrawto_command();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = [];
              s4 = peg$parsewsp();
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parsewsp();
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsedrawto_commands();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedrawto_command() {
            var s0;
      
            s0 = peg$parseclosepath();
            if (s0 === peg$FAILED) {
              s0 = peg$parselineto();
              if (s0 === peg$FAILED) {
                s0 = peg$parsehorizontal_lineto();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsevertical_lineto();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsecurveto();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsesmooth_curveto();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parsequadratic_bezier_curveto();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parsesmooth_quadratic_bezier_curveto();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parseelliptical_arc();
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
      
            return s0;
          }
      
          function peg$parsemoveto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c4.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c5); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsemoveto_argument_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c6(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemoveto_argument_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate_pair();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parselineto_argument_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseclosepath() {
            var s0, s1;
      
            s0 = peg$currPos;
            if (peg$c8.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c9); }
            }
            if (s1 !== peg$FAILED) {
              s1 = peg$c10();
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parselineto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c11.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c12); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parselineto_argument_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c13(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parselineto_argument_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate_pair();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parselineto_argument_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsehorizontal_lineto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c14.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c15); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecoordinate_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c16(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecoordinate_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsecoordinate_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsevertical_lineto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c17.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c18); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecoordinate_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c19(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecurveto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c20.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c21); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecurveto_argument_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c22(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecurveto_argument_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsecurveto_argument();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsecurveto_argument_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecurveto_argument() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate_pair();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecomma_wsp();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecoordinate_pair();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsecomma_wsp();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c2;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsecoordinate_pair();
                    if (s5 !== peg$FAILED) {
                      s1 = peg$c23(s1, s3, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsesmooth_curveto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c24.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c25); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsesmooth_curveto_argument_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c26(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsesmooth_curveto_argument_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsesmooth_curveto_argument();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsesmooth_curveto_argument_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsesmooth_curveto_argument() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate_pair();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecomma_wsp();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecoordinate_pair();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c27(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsequadratic_bezier_curveto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c28.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c29); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsequadratic_bezier_curveto_argument_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c30(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsequadratic_bezier_curveto_argument_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsequadratic_bezier_curveto_argument();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsequadratic_bezier_curveto_argument_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsequadratic_bezier_curveto_argument() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate_pair();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecomma_wsp();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecoordinate_pair();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c27(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsesmooth_quadratic_bezier_curveto() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c31.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c32); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsesmooth_quadratic_bezier_curveto_argument_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c33(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsesmooth_quadratic_bezier_curveto_argument_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate_pair();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsesmooth_quadratic_bezier_curveto_argument_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseelliptical_arc() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c34.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c35); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsewsp();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsewsp();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parseelliptical_arc_argument_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c36(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseelliptical_arc_argument_sequence() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parseelliptical_arc_argument();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parsecomma_wsp();
              if (s3 === peg$FAILED) {
                s3 = peg$c2;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parseelliptical_arc_argument_sequence();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = peg$c7(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseelliptical_arc_argument() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
      
            s0 = peg$currPos;
            s1 = peg$parsenonnegative_number();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecomma_wsp();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsenonnegative_number();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsecomma_wsp();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c2;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsenumber();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsecomma_wsp();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parseflag();
                        if (s7 !== peg$FAILED) {
                          s8 = peg$parsecomma_wsp();
                          if (s8 === peg$FAILED) {
                            s8 = peg$c2;
                          }
                          if (s8 !== peg$FAILED) {
                            s9 = peg$parseflag();
                            if (s9 !== peg$FAILED) {
                              s10 = peg$parsecomma_wsp();
                              if (s10 === peg$FAILED) {
                                s10 = peg$c2;
                              }
                              if (s10 !== peg$FAILED) {
                                s11 = peg$parsecoordinate_pair();
                                if (s11 !== peg$FAILED) {
                                  s1 = peg$c37(s1, s3, s5, s7, s9, s11);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecoordinate_pair() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parsecoordinate();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecomma_wsp();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecoordinate();
                if (s3 !== peg$FAILED) {
                  s1 = peg$c38(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecoordinate() {
            var s0, s1;
      
            s0 = peg$currPos;
            s1 = peg$parsenumber();
            if (s1 !== peg$FAILED) {
              s1 = peg$c39(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parsenonnegative_number() {
            var s0;
      
            s0 = peg$parsefloating_point_constant();
            if (s0 === peg$FAILED) {
              s0 = peg$parsedigit_sequence();
            }
      
            return s0;
          }
      
          function peg$parsenumber() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            s1 = peg$parsesign();
            if (s1 === peg$FAILED) {
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsefloating_point_constant();
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsesign();
              if (s1 === peg$FAILED) {
                s1 = peg$c2;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsedigit_sequence();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parseflag() {
            var s0;
      
            if (input.charCodeAt(peg$currPos) === 48) {
              s0 = peg$c40;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              { peg$fail(peg$c41); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 49) {
                s0 = peg$c42;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                { peg$fail(peg$c43); }
              }
            }
      
            return s0;
          }
      
          function peg$parsecomma_wsp() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsewsp();
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parsewsp();
              }
            } else {
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecomma();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsewsp();
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parsewsp();
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsecomma();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parsewsp();
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parsewsp();
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parsecomma() {
            var s0;
      
            if (input.charCodeAt(peg$currPos) === 44) {
              s0 = peg$c44;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              { peg$fail(peg$c45); }
            }
      
            return s0;
          }
      
          function peg$parsefloating_point_constant() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            s1 = peg$parsefractional_constant();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseexponent();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsedigit_sequence();
              if (s1 !== peg$FAILED) {
                s2 = peg$parseexponent();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parsefractional_constant() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parsedigit_sequence();
            if (s1 === peg$FAILED) {
              s1 = peg$c2;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s2 = peg$c46;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                { peg$fail(peg$c47); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsedigit_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsedigit_sequence();
              if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s2 = peg$c46;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  { peg$fail(peg$c47); }
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parseexponent() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c48.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              { peg$fail(peg$c49); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsesign();
              if (s2 === peg$FAILED) {
                s2 = peg$c2;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsedigit_sequence();
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsesign() {
            var s0;
      
            if (input.charCodeAt(peg$currPos) === 43) {
              s0 = peg$c50;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              { peg$fail(peg$c51); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 45) {
                s0 = peg$c52;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                { peg$fail(peg$c53); }
              }
            }
      
            return s0;
          }
      
          function peg$parsedigit_sequence() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            s1 = [];
            if (peg$c54.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              { peg$fail(peg$c55); }
            }
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (peg$c54.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  { peg$fail(peg$c55); }
                }
              }
            } else {
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              s1 = peg$c56(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parsewsp() {
            var s0;
      
            if (peg$c57.test(input.charAt(peg$currPos))) {
              s0 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              { peg$fail(peg$c58); }
            }
      
            return s0;
          }
      
      
            // The last coordinate we are at in the path. In absolute coords.
            var lastCoord = [0, 0];
            // The last control point we encountered in the path. In absolute coords.
            var lastControl = [0, 0];
            // The list of operations we've parsed so far.
            var ops = [];
            // Have we parsed the first sub-path yet?
            var firstSubPath = true;
            // The letter of the last parsed command.
            var lastCh = '';
      
            // Flatten an array.
            function flatten(a) {
              var flat = [];
              for (var i = 0; i < a.length; i++) {
                if (a[i] instanceof Array) {
                  flat.push.apply(flat, flatten(a[i]));
                } else {
                  flat.push(a[i]);
                }
              }
              return flat;
            }
      
            // Convert a position into an absolute position.
            function makeAbsolute(c, coord) {
              if ('mlazhvcsqt'.indexOf(c) === -1) {
                lastCoord = coord;
              } else {
                lastCoord[0] += coord[0];
                lastCoord[1] += coord[1];
              }
              lastCh = c;
              return lastCoord.slice(0);
            }
      
            // Convert a sequence of coordinates into absolute coordinates.
            //
            // For arguments that take multiple coord pairs, such as bezier.
            function makeAbsoluteMultiple(c, seq) {
              var r = [];
              var lastPosCopy = lastCoord.slice(0);
              for (var i=0; i < seq.length; i+=2) {
                // Only the last point should update lastCoord.
                lastCoord = lastPosCopy.slice(0);
                var coord = makeAbsolute(c, seq.slice(i, i+2));
                r = r.concat(coord);
                // Record the last control point, it might be needed for
                // shorthand operations.
                if (i == seq.length-4) {
                  lastControl = coord.slice(0);
                }
              }
              return r;
            }
      
            // Find the reflection of the last control point over
            // the last postion in the path.
            function makeReflected() {
              if ('CcSsQqTt'.indexOf(lastCh) == -1) {
                lastControl = lastCoord.slice(0);
              }
              // reflected = 2*lastCoord - lastControl
              // Note the result is absolute, not relative.
              var r = [0, 0];
              r[0] = 2*lastCoord[0] - lastControl[0];
              r[1] = 2*lastCoord[1] - lastControl[1];
              return r;
            }
      
            function makeAbsoluteFromX(c, x) {
              var coord = [x, 0];
              if (c == 'H') {
                coord[1] = lastCoord[1];
              }
              return makeAbsolute(c, coord);
            }
      
            function makeAbsoluteFromY(c, y) {
              var coord = [0, y];
              if (c == 'V') {
                coord[0] = lastCoord[0];
              }
              return makeAbsolute(c, coord);
            }
      
            function concatSequence(one, rest) {
              var r = [one];
              if (rest && rest.length > 1) {
                var rem = rest[1];
                for (var i = 0; i < rem.length; i++) {
                  r.push(rem[i]);
                }
              }
              return r;
            }
      
            function mag(v) {
              return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
            }
      
            function dot(u, v) {
              return (u[0]*v[0] + u[1]*v[1]);
            }
      
            function ratio(u, v) {
              return dot(u,v) / (mag(u)*mag(v))
            }

            function clamp(value, min, max) {
              return Math.min(Math.max(val, min),max);
            }
      
            function angle(u, v) {
              var sign = 1.0;
              if ((u[0]*v[1] - u[1]*v[0]) < 0) {
                sign = -1.0;
              }
              return sign * Math.acos(clamp(ratio(u,v)), -1, 1);
            }
      
            function rotClockwise(v, angle) {
              var cost = Math.cos(angle);
              var sint = Math.sin(angle);
              return [cost*v[0] + sint*v[1], -1 * sint*v[0] + cost*v[1]];
            }
      
            function rotCounterClockwise(v, angle) {
              var cost = Math.cos(angle);
              var sint = Math.sin(angle);
              return [cost*v[0] - sint*v[1], sint*v[0] + cost*v[1]];
            }
      
            function midPoint(u, v) {
              return [(u[0] - v[0])/2.0, (u[1] - v[1])/2.0];
            }
      
            function meanVec(u, v) {
              return [(u[0] + v[0])/2.0, (u[1] + v[1])/2.0];
            }
      
            function pointMul(u, v) {
              return [u[0]*v[0], u[1]*v[1]];
            }
      
            function scale(c, v) {
              return [c*v[0], c*v[1]];
            }
      
            function sum(u, v) {
              return [u[0] + v[0], u[1] + v[1]];
            }
      
            // Convert an SVG elliptical arc to a series of canvas commands.
            //
            // x1, x2: start and stop coordinates of the ellipse.
            // rx, ry: radii of the ellipse.
            // phi: rotation of the ellipse.
            // fA: large arc flag.
            // fS: sweep flag.
            function ellipseFromEllipticalArc(x1, rx, ry, phi, fA, fS, x2) {
              // Convert from endpoint to center parametrization, as detailed in:
              //   http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
              if (rx == 0 || ry == 0) {
                ops.push({type: 'lineTo', args: x2});
                return;
              }
              var phi = phi * (Math.PI / 180.0);
              rx = Math.abs(rx);
              ry = Math.abs(ry);
              var xPrime = rotClockwise(midPoint(x1, x2), phi);                // F.6.5.1
              var xPrime2 = pointMul(xPrime, xPrime);
              var rx2 = Math.pow(rx, 2);
              var ry2 = Math.pow(ry, 2);
      
              var lambda = Math.sqrt(xPrime2[0]/rx2 + xPrime2[1]/ry2);
              if (lambda > 1) {
                rx *= lambda;
                ry *= lambda;
                rx2 = Math.pow(rx, 2);
                ry2 = Math.pow(ry, 2);
              }
              var factor = Math.sqrt(Math.abs(rx2*ry2 - rx2*xPrime2[1] - ry2*xPrime2[0]) /
                (rx2*xPrime2[1] + ry2*xPrime2[0]));
              if (fA == fS) {
                factor *= -1.0;
              }
              var cPrime = scale(factor, [rx*xPrime[1]/ry, -ry*xPrime[0]/rx]); // F.6.5.2
              var c = sum(rotCounterClockwise(cPrime, phi), meanVec(x1, x2));  // F.6.5.3
              var x1UnitVector = [(xPrime[0] - cPrime[0])/rx, (xPrime[1] - cPrime[1])/ry];
              var x2UnitVector = [(-1.0*xPrime[0] - cPrime[0])/rx, (-1.0*xPrime[1] - cPrime[1])/ry];
              var theta = angle([1, 0], x1UnitVector);                         // F.6.5.5
              var deltaTheta = angle(x1UnitVector, x2UnitVector);              // F.6.5.6
              var start = theta;
              var end = theta+deltaTheta;
              ops.push(
                {type: 'save', args: []},
                {type: 'translate', args: [c[0], c[1]]},
                {type: 'rotate', args: [phi]},
                {type: 'scale', args: [rx, ry]},
                {type: 'arc', args: [0, 0, 1, start, end, 1-fS]},
                {type: 'restore', args: []}
                );
            }
      
      
          peg$result = peg$startRuleFunction();
      
          if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
          } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
              peg$fail({ type: "end", description: "end of input" });
            }
      
            throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
          }
        }
      
        return {
          SyntaxError: SyntaxError,
          parse:       parse
        };
      })();

      function Path_(arg) {
        this.ops_ = [];
        if (arg == undefined) {
          return;
        }
        if (typeof arg == 'string') {
          try {
            this.ops_ = parser.parse(arg);
          } catch(e) {
            // Treat an invalid SVG path as an empty path.
          }
        } else if (arg.hasOwnProperty('ops_')) {
          this.ops_ = arg.ops_.slice(0);
        } else {
          throw 'Error: ' + typeof arg + 'is not a valid argument to Path';
        }
      }
      // TODO(jcgregorio) test for arcTo and implement via something.


      // Path methods that map simply to the CanvasRenderingContext2D.
      var simple_mapping = [
        'closePath',
        'moveTo',
        'lineTo',
        'quadraticCurveTo',
        'bezierCurveTo',
        'rect',
        'arc',
        'arcTo',
        'ellipse',
        'isPointInPath',
        'isPointInStroke',
        ];

      function createFunction(name) {
        return function() {
          this.ops_.push({type: name, args: Array.prototype.slice.call(arguments, 0)});
        };
      }

      // Add simple_mapping methods to Path2D.
      for (var i=0; i<simple_mapping.length; i++) {
        var name = simple_mapping[i];
        Path_.prototype[name] = createFunction(name);
      }

      Path_.prototype['addPath'] = function(path, tr) {
        var hasTx = false;
        if (tr
            && tr.a != undefined
            && tr.b != undefined
            && tr.c != undefined
            && tr.d != undefined
            && tr.e != undefined
            && tr.f != undefined) {
          hasTx = true;
          this.ops_.push({type: 'save', args: []});
          this.ops_.push({type: 'transform', args: [tr.a, tr.b, tr.c, tr.d, tr.e, tr.f]});
        }
        this.ops_ = this.ops_.concat(path.ops_);
        if (hasTx) {
          this.ops_.push({type: 'restore', args: []});
        }
      };

      var original_fill = CanvasRenderingContext2D.prototype.fill;
      var original_stroke = CanvasRenderingContext2D.prototype.stroke;
      var original_clip = CanvasRenderingContext2D.prototype.clip;
      var original_is_point_in_path = CanvasRenderingContext2D.prototype.isPointInPath;
      var original_is_point_in_stroke = CanvasRenderingContext2D.prototype.isPointInStroke;

      // Replace methods on CanvasRenderingContext2D with ones that understand Path2D.
      CanvasRenderingContext2D.prototype.fill = function(arg) {
        if (arg instanceof Path_) {
          this.beginPath();
          for (var i = 0, len = arg.ops_.length; i < len; i++) {
            var op = arg.ops_[i];
            CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
          }
          original_fill.apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
          original_fill.apply(this, arguments);
        }
      };

      CanvasRenderingContext2D.prototype.stroke = function(arg) {
        if (arg instanceof Path_) {
          this.beginPath();
          for (var i = 0, len = arg.ops_.length; i < len; i++) {
            var op = arg.ops_[i];
            CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
          }
          original_stroke.call(this);
        } else {
          original_stroke.call(this);
        }
      };

      CanvasRenderingContext2D.prototype.clip = function(arg) {
        if (arg instanceof Path_) {
          // Note that we don't save and restore the context state, since the
          // clip region is part of the state. Not really a problem since the
          // HTML 5 spec doesn't say that clip(path) doesn't affect the current
          // path.
          this.beginPath();
          for (var i = 0, len = arg.ops_.length; i < len; i++) {
            var op = arg.ops_[i];
            CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
          }
          original_clip.apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
          original_clip.apply(this, arguments);
        }
      };

      CanvasRenderingContext2D.prototype.isPointInPath = function(arg) {
        if (arg instanceof Path_) {
          this.beginPath();
          for (var i = 0, len = arg.ops_.length; i < len; i++) {
            var op = arg.ops_[i];
            CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
          }
          return original_is_point_in_path.apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
          return original_is_point_in_path.apply(this, arguments);
        }
      };
      CanvasRenderingContext2D.prototype.isPointInStroke = function(arg) {
        if (arg instanceof Path_) {
          this.beginPath();
          for (var i = 0, len = arg.ops_.length; i < len; i++) {
            var op = arg.ops_[i];
            CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
          }
          return original_is_point_in_stroke.apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
          return original_is_point_in_stroke.apply(this, arguments);
        }
      };

      // Set up externs.
      window.Path2D = Path_;
    })();
  }

  })(
    typeof CanvasRenderingContext2D === "undefined" ? undefined : CanvasRenderingContext2D,
    typeof commonjsRequire === "undefined" ? undefined : commonjsRequire
  );

  var _anInstance = function (it, Constructor, name, forbiddenField) {
    if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
      throw TypeError(name + ': incorrect invocation!');
    } return it;
  };

  // call something on iterator step with safe closing on error

  var _iterCall = function (iterator, fn, value, entries) {
    try {
      return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined) _anObject(ret.call(iterator));
      throw e;
    }
  };

  // check on default Array iterator

  var ITERATOR$2 = _wks('iterator');
  var ArrayProto$1 = Array.prototype;

  var _isArrayIter = function (it) {
    return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR$2] === it);
  };

  var ITERATOR$3 = _wks('iterator');

  var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$3]
      || it['@@iterator']
      || _iterators[_classof(it)];
  };

  var _forOf = createCommonjsModule(function (module) {
  var BREAK = {};
  var RETURN = {};
  var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
    var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
    var f = _ctx(fn, that, entries ? 2 : 1);
    var index = 0;
    var length, step, iterator, result;
    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
    // fast case for arrays with default iterator
    if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
      result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      if (result === BREAK || result === RETURN) return result;
    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
      result = _iterCall(iterator, f, step.value, entries);
      if (result === BREAK || result === RETURN) return result;
    }
  };
  exports.BREAK = BREAK;
  exports.RETURN = RETURN;
  });

  // 7.3.20 SpeciesConstructor(O, defaultConstructor)


  var SPECIES$2 = _wks('species');
  var _speciesConstructor = function (O, D) {
    var C = _anObject(O).constructor;
    var S;
    return C === undefined || (S = _anObject(C)[SPECIES$2]) == undefined ? D : _aFunction(S);
  };

  // fast apply, http://jsperf.lnkit.com/fast-apply/5
  var _invoke = function (fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0: return un ? fn()
                        : fn.call(that);
      case 1: return un ? fn(args[0])
                        : fn.call(that, args[0]);
      case 2: return un ? fn(args[0], args[1])
                        : fn.call(that, args[0], args[1]);
      case 3: return un ? fn(args[0], args[1], args[2])
                        : fn.call(that, args[0], args[1], args[2]);
      case 4: return un ? fn(args[0], args[1], args[2], args[3])
                        : fn.call(that, args[0], args[1], args[2], args[3]);
    } return fn.apply(that, args);
  };

  var process = _global.process;
  var setTask = _global.setImmediate;
  var clearTask = _global.clearImmediate;
  var MessageChannel = _global.MessageChannel;
  var Dispatch = _global.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;
  var run = function () {
    var id = +this;
    // eslint-disable-next-line no-prototype-builtins
    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };
  var listener = function (event) {
    run.call(event.data);
  };
  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
  if (!setTask || !clearTask) {
    setTask = function setImmediate(fn) {
      var args = [];
      var i = 1;
      while (arguments.length > i) args.push(arguments[i++]);
      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func
        _invoke(typeof fn == 'function' ? fn : Function(fn), args);
      };
      defer(counter);
      return counter;
    };
    clearTask = function clearImmediate(id) {
      delete queue[id];
    };
    // Node.js 0.8-
    if (_cof(process) == 'process') {
      defer = function (id) {
        process.nextTick(_ctx(run, id, 1));
      };
    // Sphere (JS game engine) Dispatch API
    } else if (Dispatch && Dispatch.now) {
      defer = function (id) {
        Dispatch.now(_ctx(run, id, 1));
      };
    // Browsers with MessageChannel, includes WebWorkers
    } else if (MessageChannel) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = _ctx(port.postMessage, port, 1);
    // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
      defer = function (id) {
        _global.postMessage(id + '', '*');
      };
      _global.addEventListener('message', listener, false);
    // IE8-
    } else if (ONREADYSTATECHANGE in _domCreate('script')) {
      defer = function (id) {
        _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
          _html.removeChild(this);
          run.call(id);
        };
      };
    // Rest old browsers
    } else {
      defer = function (id) {
        setTimeout(_ctx(run, id, 1), 0);
      };
    }
  }
  var _task = {
    set: setTask,
    clear: clearTask
  };

  var macrotask = _task.set;
  var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
  var process$1 = _global.process;
  var Promise$1 = _global.Promise;
  var isNode = _cof(process$1) == 'process';

  var _microtask = function () {
    var head, last, notify;

    var flush = function () {
      var parent, fn;
      if (isNode && (parent = process$1.domain)) parent.exit();
      while (head) {
        fn = head.fn;
        head = head.next;
        try {
          fn();
        } catch (e) {
          if (head) notify();
          else last = undefined;
          throw e;
        }
      } last = undefined;
      if (parent) parent.enter();
    };

    // Node.js
    if (isNode) {
      notify = function () {
        process$1.nextTick(flush);
      };
    // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
    } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
      var toggle = true;
      var node = document.createTextNode('');
      new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
      notify = function () {
        node.data = toggle = !toggle;
      };
    // environments with maybe non-completely correct, but existent Promise
    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      var promise = Promise$1.resolve(undefined);
      notify = function () {
        promise.then(flush);
      };
    // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout
    } else {
      notify = function () {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(_global, flush);
      };
    }

    return function (fn) {
      var task = { fn: fn, next: undefined };
      if (last) last.next = task;
      if (!head) {
        head = task;
        notify();
      } last = task;
    };
  };

  // 25.4.1.5 NewPromiseCapability(C)


  function PromiseCapability(C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = _aFunction(resolve);
    this.reject = _aFunction(reject);
  }

  var f$1 = function (C) {
    return new PromiseCapability(C);
  };

  var _newPromiseCapability = {
  	f: f$1
  };

  var _perform = function (exec) {
    try {
      return { e: false, v: exec() };
    } catch (e) {
      return { e: true, v: e };
    }
  };

  var navigator = _global.navigator;

  var _userAgent = navigator && navigator.userAgent || '';

  var _promiseResolve = function (C, x) {
    _anObject(C);
    if (_isObject(x) && x.constructor === C) return x;
    var promiseCapability = _newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var _redefineAll = function (target, src, safe) {
    for (var key in src) _redefine(target, key, src[key], safe);
    return target;
  };

  var SPECIES$3 = _wks('species');

  var _setSpecies = function (KEY) {
    var C = _global[KEY];
    if (_descriptors && C && !C[SPECIES$3]) _objectDp.f(C, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  };

  var ITERATOR$4 = _wks('iterator');
  var SAFE_CLOSING = false;

  try {
    var riter = [7][ITERATOR$4]();
    riter['return'] = function () { SAFE_CLOSING = true; };
  } catch (e) { /* empty */ }

  var _iterDetect = function (exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;
    try {
      var arr = [7];
      var iter = arr[ITERATOR$4]();
      iter.next = function () { return { done: safe = true }; };
      arr[ITERATOR$4] = function () { return iter; };
      exec(arr);
    } catch (e) { /* empty */ }
    return safe;
  };

  var task = _task.set;
  var microtask = _microtask();




  var PROMISE = 'Promise';
  var TypeError$1 = _global.TypeError;
  var process$2 = _global.process;
  var versions = process$2 && process$2.versions;
  var v8 = versions && versions.v8 || '';
  var $Promise = _global[PROMISE];
  var isNode$1 = _classof(process$2) == 'process';
  var empty = function () { /* empty */ };
  var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
  var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

  var USE_NATIVE = !!function () {
    try {
      // correct subclassing with @@species support
      var promise = $Promise.resolve(1);
      var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
        exec(empty, empty);
      };
      // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
      return (isNode$1 || typeof PromiseRejectionEvent == 'function')
        && promise.then(empty) instanceof FakePromise
        // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
        // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
        // we can't detect it synchronously, so just check versions
        && v8.indexOf('6.6') !== 0
        && _userAgent.indexOf('Chrome/66') === -1;
    } catch (e) { /* empty */ }
  }();

  // helpers
  var isThenable = function (it) {
    var then;
    return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
  };
  var notify = function (promise, isReject) {
    if (promise._n) return;
    promise._n = true;
    var chain = promise._c;
    microtask(function () {
      var value = promise._v;
      var ok = promise._s == 1;
      var i = 0;
      var run = function (reaction) {
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;
        try {
          if (handler) {
            if (!ok) {
              if (promise._h == 2) onHandleUnhandled(promise);
              promise._h = 1;
            }
            if (handler === true) result = value;
            else {
              if (domain) domain.enter();
              result = handler(value); // may throw
              if (domain) {
                domain.exit();
                exited = true;
              }
            }
            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (e) {
          if (domain && !exited) domain.exit();
          reject(e);
        }
      };
      while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
      promise._c = [];
      promise._n = false;
      if (isReject && !promise._h) onUnhandled(promise);
    });
  };
  var onUnhandled = function (promise) {
    task.call(_global, function () {
      var value = promise._v;
      var unhandled = isUnhandled(promise);
      var result, handler, console;
      if (unhandled) {
        result = _perform(function () {
          if (isNode$1) {
            process$2.emit('unhandledRejection', value, promise);
          } else if (handler = _global.onunhandledrejection) {
            handler({ promise: promise, reason: value });
          } else if ((console = _global.console) && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        });
        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
        promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
      } promise._a = undefined;
      if (unhandled && result.e) throw result.v;
    });
  };
  var isUnhandled = function (promise) {
    return promise._h !== 1 && (promise._a || promise._c).length === 0;
  };
  var onHandleUnhandled = function (promise) {
    task.call(_global, function () {
      var handler;
      if (isNode$1) {
        process$2.emit('rejectionHandled', promise);
      } else if (handler = _global.onrejectionhandled) {
        handler({ promise: promise, reason: promise._v });
      }
    });
  };
  var $reject = function (value) {
    var promise = this;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    promise._v = value;
    promise._s = 2;
    if (!promise._a) promise._a = promise._c.slice();
    notify(promise, true);
  };
  var $resolve = function (value) {
    var promise = this;
    var then;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    try {
      if (promise === value) throw TypeError$1("Promise can't be resolved itself");
      if (then = isThenable(value)) {
        microtask(function () {
          var wrapper = { _w: promise, _d: false }; // wrap
          try {
            then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        promise._v = value;
        promise._s = 1;
        notify(promise, false);
      }
    } catch (e) {
      $reject.call({ _w: promise, _d: false }, e); // wrap
    }
  };

  // constructor polyfill
  if (!USE_NATIVE) {
    // 25.4.3.1 Promise(executor)
    $Promise = function Promise(executor) {
      _anInstance(this, $Promise, PROMISE, '_h');
      _aFunction(executor);
      Internal.call(this);
      try {
        executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
      } catch (err) {
        $reject.call(this, err);
      }
    };
    // eslint-disable-next-line no-unused-vars
    Internal = function Promise(executor) {
      this._c = [];             // <- awaiting reactions
      this._a = undefined;      // <- checked in isUnhandled reactions
      this._s = 0;              // <- state
      this._d = false;          // <- done
      this._v = undefined;      // <- value
      this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
      this._n = false;          // <- notify
    };
    Internal.prototype = _redefineAll($Promise.prototype, {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function then(onFulfilled, onRejected) {
        var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = isNode$1 ? process$2.domain : undefined;
        this._c.push(reaction);
        if (this._a) this._a.push(reaction);
        if (this._s) notify(this, false);
        return reaction.promise;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function (onRejected) {
        return this.then(undefined, onRejected);
      }
    });
    OwnPromiseCapability = function () {
      var promise = new Internal();
      this.promise = promise;
      this.resolve = _ctx($resolve, promise, 1);
      this.reject = _ctx($reject, promise, 1);
    };
    _newPromiseCapability.f = newPromiseCapability = function (C) {
      return C === $Promise || C === Wrapper
        ? new OwnPromiseCapability(C)
        : newGenericPromiseCapability(C);
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
  _setToStringTag($Promise, PROMISE);
  _setSpecies(PROMISE);
  Wrapper = _core[PROMISE];

  // statics
  _export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
    // 25.4.4.5 Promise.reject(r)
    reject: function reject(r) {
      var capability = newPromiseCapability(this);
      var $$reject = capability.reject;
      $$reject(r);
      return capability.promise;
    }
  });
  _export(_export.S + _export.F * (!USE_NATIVE), PROMISE, {
    // 25.4.4.6 Promise.resolve(x)
    resolve: function resolve(x) {
      return _promiseResolve(this, x);
    }
  });
  _export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
    $Promise.all(iter)['catch'](empty);
  })), PROMISE, {
    // 25.4.4.1 Promise.all(iterable)
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = _perform(function () {
        var values = [];
        var index = 0;
        var remaining = 1;
        _forOf(iterable, false, function (promise) {
          var $index = index++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          C.resolve(promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[$index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (result.e) reject(result.v);
      return capability.promise;
    },
    // 25.4.4.4 Promise.race(iterable)
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var reject = capability.reject;
      var result = _perform(function () {
        _forOf(iterable, false, function (promise) {
          C.resolve(promise).then(capability.resolve, reject);
        });
      });
      if (result.e) reject(result.v);
      return capability.promise;
    }
  });

  var TYPED = _uid('typed_array');
  var VIEW = _uid('view');
  var ABV = !!(_global.ArrayBuffer && _global.DataView);
  var CONSTR = ABV;
  var i$1 = 0;
  var l = 9;
  var Typed;

  var TypedArrayConstructors = (
    'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
  ).split(',');

  while (i$1 < l) {
    if (Typed = _global[TypedArrayConstructors[i$1++]]) {
      _hide(Typed.prototype, TYPED, true);
      _hide(Typed.prototype, VIEW, true);
    } else CONSTR = false;
  }

  var _typed = {
    ABV: ABV,
    CONSTR: CONSTR,
    TYPED: TYPED,
    VIEW: VIEW
  };

  // https://tc39.github.io/ecma262/#sec-toindex


  var _toIndex = function (it) {
    if (it === undefined) return 0;
    var number = _toInteger(it);
    var length = _toLength(number);
    if (number !== length) throw RangeError('Wrong length!');
    return length;
  };

  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

  var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

  var f$2 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return _objectKeysInternal(O, hiddenKeys);
  };

  var _objectGopn = {
  	f: f$2
  };

  var _arrayFill = function fill(value /* , start = 0, end = @length */) {
    var O = _toObject(this);
    var length = _toLength(O.length);
    var aLen = arguments.length;
    var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
    var end = aLen > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
    while (endPos > index) O[index++] = value;
    return O;
  };

  var _typedBuffer = createCommonjsModule(function (module, exports) {











  var gOPN = _objectGopn.f;
  var dP = _objectDp.f;


  var ARRAY_BUFFER = 'ArrayBuffer';
  var DATA_VIEW = 'DataView';
  var PROTOTYPE = 'prototype';
  var WRONG_LENGTH = 'Wrong length!';
  var WRONG_INDEX = 'Wrong index!';
  var $ArrayBuffer = _global[ARRAY_BUFFER];
  var $DataView = _global[DATA_VIEW];
  var Math = _global.Math;
  var RangeError = _global.RangeError;
  // eslint-disable-next-line no-shadow-restricted-names
  var Infinity = _global.Infinity;
  var BaseBuffer = $ArrayBuffer;
  var abs = Math.abs;
  var pow = Math.pow;
  var floor = Math.floor;
  var log = Math.log;
  var LN2 = Math.LN2;
  var BUFFER = 'buffer';
  var BYTE_LENGTH = 'byteLength';
  var BYTE_OFFSET = 'byteOffset';
  var $BUFFER = _descriptors ? '_b' : BUFFER;
  var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
  var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET;

  // IEEE754 conversions based on https://github.com/feross/ieee754
  function packIEEE754(value, mLen, nBytes) {
    var buffer = new Array(nBytes);
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
    var i = 0;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    var e, m, c;
    value = abs(value);
    // eslint-disable-next-line no-self-compare
    if (value != value || value === Infinity) {
      // eslint-disable-next-line no-self-compare
      m = value != value ? 1 : 0;
      e = eMax;
    } else {
      e = floor(log(value) / LN2);
      if (value * (c = pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * pow(2, eBias - 1) * pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
    buffer[--i] |= s * 128;
    return buffer;
  }
  function unpackIEEE754(buffer, mLen, nBytes) {
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = eLen - 7;
    var i = nBytes - 1;
    var s = buffer[i--];
    var e = s & 127;
    var m;
    s >>= 7;
    for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : s ? -Infinity : Infinity;
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    } return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function unpackI32(bytes) {
    return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
  }
  function packI8(it) {
    return [it & 0xff];
  }
  function packI16(it) {
    return [it & 0xff, it >> 8 & 0xff];
  }
  function packI32(it) {
    return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
  }
  function packF64(it) {
    return packIEEE754(it, 52, 8);
  }
  function packF32(it) {
    return packIEEE754(it, 23, 4);
  }

  function addGetter(C, key, internal) {
    dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
  }

  function get(view, bytes, index, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = store.slice(start, start + bytes);
    return isLittleEndian ? pack : pack.reverse();
  }
  function set(view, bytes, index, conversion, value, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = conversion(+value);
    for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
  }

  if (!_typed.ABV) {
    $ArrayBuffer = function ArrayBuffer(length) {
      _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
      var byteLength = _toIndex(length);
      this._b = _arrayFill.call(new Array(byteLength), 0);
      this[$LENGTH] = byteLength;
    };

    $DataView = function DataView(buffer, byteOffset, byteLength) {
      _anInstance(this, $DataView, DATA_VIEW);
      _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
      var bufferLength = buffer[$LENGTH];
      var offset = _toInteger(byteOffset);
      if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
      byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
      if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
      this[$BUFFER] = buffer;
      this[$OFFSET] = offset;
      this[$LENGTH] = byteLength;
    };

    if (_descriptors) {
      addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
      addGetter($DataView, BUFFER, '_b');
      addGetter($DataView, BYTE_LENGTH, '_l');
      addGetter($DataView, BYTE_OFFSET, '_o');
    }

    _redefineAll($DataView[PROTOTYPE], {
      getInt8: function getInt8(byteOffset) {
        return get(this, 1, byteOffset)[0] << 24 >> 24;
      },
      getUint8: function getUint8(byteOffset) {
        return get(this, 1, byteOffset)[0];
      },
      getInt16: function getInt16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
      },
      getUint16: function getUint16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return bytes[1] << 8 | bytes[0];
      },
      getInt32: function getInt32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1]));
      },
      getUint32: function getUint32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
      },
      getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
      },
      getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
      },
      setInt8: function setInt8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setUint8: function setUint8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packF32, value, arguments[2]);
      },
      setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
        set(this, 8, byteOffset, packF64, value, arguments[2]);
      }
    });
  } else {
    if (!_fails(function () {
      $ArrayBuffer(1);
    }) || !_fails(function () {
      new $ArrayBuffer(-1); // eslint-disable-line no-new
    }) || _fails(function () {
      new $ArrayBuffer(); // eslint-disable-line no-new
      new $ArrayBuffer(1.5); // eslint-disable-line no-new
      new $ArrayBuffer(NaN); // eslint-disable-line no-new
      return $ArrayBuffer.name != ARRAY_BUFFER;
    })) {
      $ArrayBuffer = function ArrayBuffer(length) {
        _anInstance(this, $ArrayBuffer);
        return new BaseBuffer(_toIndex(length));
      };
      var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
      for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
        if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
      }
      ArrayBufferProto.constructor = $ArrayBuffer;
    }
    // iOS Safari 7.x bug
    var view = new $DataView(new $ArrayBuffer(2));
    var $setInt8 = $DataView[PROTOTYPE].setInt8;
    view.setInt8(0, 2147483648);
    view.setInt8(1, 2147483649);
    if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
      setInt8: function setInt8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      },
      setUint8: function setUint8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      }
    }, true);
  }
  _setToStringTag($ArrayBuffer, ARRAY_BUFFER);
  _setToStringTag($DataView, DATA_VIEW);
  _hide($DataView[PROTOTYPE], _typed.VIEW, true);
  exports[ARRAY_BUFFER] = $ArrayBuffer;
  exports[DATA_VIEW] = $DataView;
  });

  var _arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
    var O = _toObject(this);
    var len = _toLength(O.length);
    var to = _toAbsoluteIndex(target, len);
    var from = _toAbsoluteIndex(start, len);
    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;
    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }
    while (count-- > 0) {
      if (from in O) O[to] = O[from];
      else delete O[to];
      to += inc;
      from += inc;
    } return O;
  };

  var f$3 = {}.propertyIsEnumerable;

  var _objectPie = {
  	f: f$3
  };

  var gOPD = Object.getOwnPropertyDescriptor;

  var f$4 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = _toIobject(O);
    P = _toPrimitive(P, true);
    if (_ie8DomDefine) try {
      return gOPD(O, P);
    } catch (e) { /* empty */ }
    if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
  };

  var _objectGopd = {
  	f: f$4
  };

  var _typedArray = createCommonjsModule(function (module) {
  if (_descriptors) {
    var LIBRARY = _library;
    var global = _global;
    var fails = _fails;
    var $export = _export;
    var $typed = _typed;
    var $buffer = _typedBuffer;
    var ctx = _ctx;
    var anInstance = _anInstance;
    var propertyDesc = _propertyDesc;
    var hide = _hide;
    var redefineAll = _redefineAll;
    var toInteger = _toInteger;
    var toLength = _toLength;
    var toIndex = _toIndex;
    var toAbsoluteIndex = _toAbsoluteIndex;
    var toPrimitive = _toPrimitive;
    var has = _has;
    var classof = _classof;
    var isObject = _isObject;
    var toObject = _toObject;
    var isArrayIter = _isArrayIter;
    var create = _objectCreate;
    var getPrototypeOf = _objectGpo;
    var gOPN = _objectGopn.f;
    var getIterFn = core_getIteratorMethod;
    var uid = _uid;
    var wks = _wks;
    var createArrayMethod = _arrayMethods;
    var createArrayIncludes = _arrayIncludes;
    var speciesConstructor = _speciesConstructor;
    var ArrayIterators = es6_array_iterator;
    var Iterators = _iterators;
    var $iterDetect = _iterDetect;
    var setSpecies = _setSpecies;
    var arrayFill = _arrayFill;
    var arrayCopyWithin = _arrayCopyWithin;
    var $DP = _objectDp;
    var $GOPD = _objectGopd;
    var dP = $DP.f;
    var gOPD = $GOPD.f;
    var RangeError = global.RangeError;
    var TypeError = global.TypeError;
    var Uint8Array = global.Uint8Array;
    var ARRAY_BUFFER = 'ArrayBuffer';
    var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
    var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
    var PROTOTYPE = 'prototype';
    var ArrayProto = Array[PROTOTYPE];
    var $ArrayBuffer = $buffer.ArrayBuffer;
    var $DataView = $buffer.DataView;
    var arrayForEach = createArrayMethod(0);
    var arrayFilter = createArrayMethod(2);
    var arraySome = createArrayMethod(3);
    var arrayEvery = createArrayMethod(4);
    var arrayFind = createArrayMethod(5);
    var arrayFindIndex = createArrayMethod(6);
    var arrayIncludes = createArrayIncludes(true);
    var arrayIndexOf = createArrayIncludes(false);
    var arrayValues = ArrayIterators.values;
    var arrayKeys = ArrayIterators.keys;
    var arrayEntries = ArrayIterators.entries;
    var arrayLastIndexOf = ArrayProto.lastIndexOf;
    var arrayReduce = ArrayProto.reduce;
    var arrayReduceRight = ArrayProto.reduceRight;
    var arrayJoin = ArrayProto.join;
    var arraySort = ArrayProto.sort;
    var arraySlice = ArrayProto.slice;
    var arrayToString = ArrayProto.toString;
    var arrayToLocaleString = ArrayProto.toLocaleString;
    var ITERATOR = wks('iterator');
    var TAG = wks('toStringTag');
    var TYPED_CONSTRUCTOR = uid('typed_constructor');
    var DEF_CONSTRUCTOR = uid('def_constructor');
    var ALL_CONSTRUCTORS = $typed.CONSTR;
    var TYPED_ARRAY = $typed.TYPED;
    var VIEW = $typed.VIEW;
    var WRONG_LENGTH = 'Wrong length!';

    var $map = createArrayMethod(1, function (O, length) {
      return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
    });

    var LITTLE_ENDIAN = fails(function () {
      // eslint-disable-next-line no-undef
      return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
    });

    var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
      new Uint8Array(1).set({});
    });

    var toOffset = function (it, BYTES) {
      var offset = toInteger(it);
      if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
      return offset;
    };

    var validate = function (it) {
      if (isObject(it) && TYPED_ARRAY in it) return it;
      throw TypeError(it + ' is not a typed array!');
    };

    var allocate = function (C, length) {
      if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
        throw TypeError('It is not a typed array constructor!');
      } return new C(length);
    };

    var speciesFromList = function (O, list) {
      return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
    };

    var fromList = function (C, list) {
      var index = 0;
      var length = list.length;
      var result = allocate(C, length);
      while (length > index) result[index] = list[index++];
      return result;
    };

    var addGetter = function (it, key, internal) {
      dP(it, key, { get: function () { return this._d[internal]; } });
    };

    var $from = function from(source /* , mapfn, thisArg */) {
      var O = toObject(source);
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var iterFn = getIterFn(O);
      var i, length, values, result, step, iterator;
      if (iterFn != undefined && !isArrayIter(iterFn)) {
        for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
          values.push(step.value);
        } O = values;
      }
      if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
      for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
        result[i] = mapping ? mapfn(O[i], i) : O[i];
      }
      return result;
    };

    var $of = function of(/* ...items */) {
      var index = 0;
      var length = arguments.length;
      var result = allocate(this, length);
      while (length > index) result[index] = arguments[index++];
      return result;
    };

    // iOS Safari 6.x fails here
    var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

    var $toLocaleString = function toLocaleString() {
      return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
    };

    var proto = {
      copyWithin: function copyWithin(target, start /* , end */) {
        return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
      },
      every: function every(callbackfn /* , thisArg */) {
        return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
        return arrayFill.apply(validate(this), arguments);
      },
      filter: function filter(callbackfn /* , thisArg */) {
        return speciesFromList(this, arrayFilter(validate(this), callbackfn,
          arguments.length > 1 ? arguments[1] : undefined));
      },
      find: function find(predicate /* , thisArg */) {
        return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      findIndex: function findIndex(predicate /* , thisArg */) {
        return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      forEach: function forEach(callbackfn /* , thisArg */) {
        arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      indexOf: function indexOf(searchElement /* , fromIndex */) {
        return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      includes: function includes(searchElement /* , fromIndex */) {
        return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      join: function join(separator) { // eslint-disable-line no-unused-vars
        return arrayJoin.apply(validate(this), arguments);
      },
      lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
        return arrayLastIndexOf.apply(validate(this), arguments);
      },
      map: function map(mapfn /* , thisArg */) {
        return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduce.apply(validate(this), arguments);
      },
      reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduceRight.apply(validate(this), arguments);
      },
      reverse: function reverse() {
        var that = this;
        var length = validate(that).length;
        var middle = Math.floor(length / 2);
        var index = 0;
        var value;
        while (index < middle) {
          value = that[index];
          that[index++] = that[--length];
          that[length] = value;
        } return that;
      },
      some: function some(callbackfn /* , thisArg */) {
        return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      sort: function sort(comparefn) {
        return arraySort.call(validate(this), comparefn);
      },
      subarray: function subarray(begin, end) {
        var O = validate(this);
        var length = O.length;
        var $begin = toAbsoluteIndex(begin, length);
        return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
          O.buffer,
          O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
          toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
        );
      }
    };

    var $slice = function slice(start, end) {
      return speciesFromList(this, arraySlice.call(validate(this), start, end));
    };

    var $set = function set(arrayLike /* , offset */) {
      validate(this);
      var offset = toOffset(arguments[1], 1);
      var length = this.length;
      var src = toObject(arrayLike);
      var len = toLength(src.length);
      var index = 0;
      if (len + offset > length) throw RangeError(WRONG_LENGTH);
      while (index < len) this[offset + index] = src[index++];
    };

    var $iterators = {
      entries: function entries() {
        return arrayEntries.call(validate(this));
      },
      keys: function keys() {
        return arrayKeys.call(validate(this));
      },
      values: function values() {
        return arrayValues.call(validate(this));
      }
    };

    var isTAIndex = function (target, key) {
      return isObject(target)
        && target[TYPED_ARRAY]
        && typeof key != 'symbol'
        && key in target
        && String(+key) == String(key);
    };
    var $getDesc = function getOwnPropertyDescriptor(target, key) {
      return isTAIndex(target, key = toPrimitive(key, true))
        ? propertyDesc(2, target[key])
        : gOPD(target, key);
    };
    var $setDesc = function defineProperty(target, key, desc) {
      if (isTAIndex(target, key = toPrimitive(key, true))
        && isObject(desc)
        && has(desc, 'value')
        && !has(desc, 'get')
        && !has(desc, 'set')
        // TODO: add validation descriptor w/o calling accessors
        && !desc.configurable
        && (!has(desc, 'writable') || desc.writable)
        && (!has(desc, 'enumerable') || desc.enumerable)
      ) {
        target[key] = desc.value;
        return target;
      } return dP(target, key, desc);
    };

    if (!ALL_CONSTRUCTORS) {
      $GOPD.f = $getDesc;
      $DP.f = $setDesc;
    }

    $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
      getOwnPropertyDescriptor: $getDesc,
      defineProperty: $setDesc
    });

    if (fails(function () { arrayToString.call({}); })) {
      arrayToString = arrayToLocaleString = function toString() {
        return arrayJoin.call(this);
      };
    }

    var $TypedArrayPrototype$ = redefineAll({}, proto);
    redefineAll($TypedArrayPrototype$, $iterators);
    hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
    redefineAll($TypedArrayPrototype$, {
      slice: $slice,
      set: $set,
      constructor: function () { /* noop */ },
      toString: arrayToString,
      toLocaleString: $toLocaleString
    });
    addGetter($TypedArrayPrototype$, 'buffer', 'b');
    addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
    addGetter($TypedArrayPrototype$, 'byteLength', 'l');
    addGetter($TypedArrayPrototype$, 'length', 'e');
    dP($TypedArrayPrototype$, TAG, {
      get: function () { return this[TYPED_ARRAY]; }
    });

    // eslint-disable-next-line max-statements
    module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
      CLAMPED = !!CLAMPED;
      var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
      var GETTER = 'get' + KEY;
      var SETTER = 'set' + KEY;
      var TypedArray = global[NAME];
      var Base = TypedArray || {};
      var TAC = TypedArray && getPrototypeOf(TypedArray);
      var FORCED = !TypedArray || !$typed.ABV;
      var O = {};
      var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
      var getter = function (that, index) {
        var data = that._d;
        return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
      };
      var setter = function (that, index, value) {
        var data = that._d;
        if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
        data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
      };
      var addElement = function (that, index) {
        dP(that, index, {
          get: function () {
            return getter(this, index);
          },
          set: function (value) {
            return setter(this, index, value);
          },
          enumerable: true
        });
      };
      if (FORCED) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME, '_d');
          var index = 0;
          var offset = 0;
          var buffer, byteLength, length, klass;
          if (!isObject(data)) {
            length = toIndex(data);
            byteLength = length * BYTES;
            buffer = new $ArrayBuffer(byteLength);
          } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            buffer = data;
            offset = toOffset($offset, BYTES);
            var $len = data.byteLength;
            if ($length === undefined) {
              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
              byteLength = $len - offset;
              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
            } else {
              byteLength = toLength($length) * BYTES;
              if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
            }
            length = byteLength / BYTES;
          } else if (TYPED_ARRAY in data) {
            return fromList(TypedArray, data);
          } else {
            return $from.call(TypedArray, data);
          }
          hide(that, '_d', {
            b: buffer,
            o: offset,
            l: byteLength,
            e: length,
            v: new $DataView(buffer)
          });
          while (index < length) addElement(that, index++);
        });
        TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
        hide(TypedArrayPrototype, 'constructor', TypedArray);
      } else if (!fails(function () {
        TypedArray(1);
      }) || !fails(function () {
        new TypedArray(-1); // eslint-disable-line no-new
      }) || !$iterDetect(function (iter) {
        new TypedArray(); // eslint-disable-line no-new
        new TypedArray(null); // eslint-disable-line no-new
        new TypedArray(1.5); // eslint-disable-line no-new
        new TypedArray(iter); // eslint-disable-line no-new
      }, true)) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME);
          var klass;
          // `ws` module bug, temporarily remove validation length for Uint8Array
          // https://github.com/websockets/ws/pull/645
          if (!isObject(data)) return new Base(toIndex(data));
          if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            return $length !== undefined
              ? new Base(data, toOffset($offset, BYTES), $length)
              : $offset !== undefined
                ? new Base(data, toOffset($offset, BYTES))
                : new Base(data);
          }
          if (TYPED_ARRAY in data) return fromList(TypedArray, data);
          return $from.call(TypedArray, data);
        });
        arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
          if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
        });
        TypedArray[PROTOTYPE] = TypedArrayPrototype;
        if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
      }
      var $nativeIterator = TypedArrayPrototype[ITERATOR];
      var CORRECT_ITER_NAME = !!$nativeIterator
        && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
      var $iterator = $iterators.values;
      hide(TypedArray, TYPED_CONSTRUCTOR, true);
      hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
      hide(TypedArrayPrototype, VIEW, true);
      hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

      if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
        dP(TypedArrayPrototype, TAG, {
          get: function () { return NAME; }
        });
      }

      O[NAME] = TypedArray;

      $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

      $export($export.S, NAME, {
        BYTES_PER_ELEMENT: BYTES
      });

      $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
        from: $from,
        of: $of
      });

      if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

      $export($export.P, NAME, proto);

      setSpecies(NAME);

      $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

      $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

      if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

      $export($export.P + $export.F * fails(function () {
        new TypedArray(1).slice();
      }), NAME, { slice: $slice });

      $export($export.P + $export.F * (fails(function () {
        return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
      }) || !fails(function () {
        TypedArrayPrototype.toLocaleString.call([1, 2]);
      })), NAME, { toLocaleString: $toLocaleString });

      Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
      if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
    };
  } else module.exports = function () { /* empty */ };
  });

  _typedArray('Uint32', 4, function (init) {
    return function Uint32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  // https://www.colordic.org/w/
  var Colors = ['#00552e', '#028760', '#884898', '#2b2b2b', '#f8b500', '#eb9b6f', '#3eb370', '#9fa0a0', '#706caa', '#dd7a56', '#ea5506', '#fddea5', '#f2f2b0', '#165e83', '#b8d200', '#2792c3', '#dccb18', '#e95295', '#4f455c', '#00a381', '#e6b422'];

  function toHighDPI(canvas) {
    var ctx = canvas.getContext('2d');
    var width = canvas.width,
        height = canvas.height;
    var _window = window,
        _window$devicePixelRa = _window.devicePixelRatio,
        devicePixelRatio = _window$devicePixelRa === void 0 ? 1 : _window$devicePixelRa;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = "".concat(width, "px");
    canvas.style.height = "".concat(height, "px");
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  function toRadians(angle) {
    return angle / 180 * Math.PI;
  }
  function drawControlPoint(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.restore();
  }
  var array = new Uint32Array(1); // https://stackoverflow.com/questions/13694626/generating-random-numbers-0-to-1-with-crypto-generatevalues

  function random() {
    window.crypto.getRandomValues(array);
    return array[0] * Math.pow(2, -32);
  }
  function randomColor() {
    var randomValue = random();
    var index = Math.floor(randomValue * Colors.length);
    return Colors[index];
  } // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;

      img.onload = function () {
        resolve(img);
      };

      img.onerror = function (e) {
        reject(e);
      };
    });
  } // https://developers.google.com/web/ilt/pwa/working-with-the-fetch-api
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

  function loadImageBitmap(src) {
    return fetch(src, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }).then(function (response) {
      if (response.ok) {
        return response.blob();
      }

      throw new Error(response.statusText);
    }).then(function (blob) {
      return createImageBitmap(blob);
    });
  }
  var colorCanvas = document.createElement('canvas');
  colorCanvas.width = 1;
  colorCanvas.heith = 1;
  var colorCtx = colorCanvas.getContext('2d');
  function getColorValue(color) {
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillStyle = color;
    colorCtx.fillRect(0, 0, 1, 1);

    var _colorCtx$getImageDat = colorCtx.getImageData(0, 0, 1, 1),
        data = _colorCtx$getImageDat.data;

    var value = {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3],
      toString: function toString() {
        return "rgba(".concat(this.r, ", ").concat(this.g, ", ").concat(this.b, ", ").concat(this.a, ")");
      }
    };
    return value;
  }
  function getColorImage(image, color) {
    var width = image.width,
        height = image.height;
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    var imageData = ctx.getImageData(0, 0, width, height);
    var pix = imageData.data;
    var colorValue = getColorValue(color);

    for (var i = 0, n = pix.length; i < n; i += 4) {
      var sourceColor = {
        r: pix[i + 0],
        g: pix[i + 1],
        b: pix[i + 2]
      };
      var brightness = sourceColor.r * 0.30 + sourceColor.g * 0.59 + sourceColor.b * 0.11;
      var result = {
        r: Math.floor(colorValue.r * brightness / 255),
        g: Math.floor(colorValue.g * brightness / 255),
        b: Math.floor(colorValue.b * brightness / 255)
      };
      pix[i + 0] = result.r;
      pix[i + 1] = result.g;
      pix[i + 2] = result.b;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
  function getClientPoint(e) {
    return {
      x: (e.touches ? e.touches[0] : e).clientX,
      y: (e.touches ? e.touches[0] : e).clientY
    };
  }
  function getPointAt(view, e) {
    var bound = view.getBoundingClientRect();
    var point = getClientPoint(e);
    return {
      x: point.x - bound.left,
      y: point.y - bound.top
    };
  }

  var Clear = {
    clearRect: {
      clear: false,
      draw: function draw() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        ctx.save();
        ctx.strokeStyle = randomColor();
        ctx.beginPath();
        ctx.rect(10, 10, 100, 200);
        ctx.stroke();
        ctx.restore();
      }
    },
    canvas_width_with_bug: {
      clear: false,
      draw: function draw() {
        var ctx = this.ctx;
        ctx.canvas.width = ctx.canvas.width;
        ctx.save();
        ctx.strokeStyle = randomColor();
        ctx.beginPath();
        ctx.rect(10, 10, 100, 200);
        ctx.stroke();
        ctx.restore();
      }
    },
    canvas_width: {
      clear: false,
      draw: function draw() {
        var ctx = this.ctx;
        ctx.canvas.width = ctx.canvas.width;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.save();
        ctx.strokeStyle = randomColor();
        ctx.beginPath();
        ctx.rect(10, 10, 100, 200);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)


  _export(_export.P, 'Array', { fill: _arrayFill });

  _addToUnscopables('fill');

  // 7.2.8 IsRegExp(argument)


  var MATCH = _wks('match');
  var _isRegexp = function (it) {
    var isRegExp;
    return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
  };

  // true  -> String#at
  // false -> String#codePointAt
  var _stringAt = function (TO_STRING) {
    return function (that, pos) {
      var s = String(_defined(that));
      var i = _toInteger(pos);
      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  var at = _stringAt(true);

   // `AdvanceStringIndex` abstract operation
  // https://tc39.github.io/ecma262/#sec-advancestringindex
  var _advanceStringIndex = function (S, index, unicode) {
    return index + (unicode ? at(S, index).length : 1);
  };

  var $min = Math.min;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX$1 = 'lastIndex';
  var MAX_UINT32 = 0xffffffff;

  // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
  var SUPPORTS_Y = !_fails(function () { });

  // @@split logic
  _fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
    var internalSplit;
    if (
      'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
      'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
      'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
      '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
      '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
      ''[$SPLIT](/.?/)[LENGTH]
    ) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(this);
        if (separator === undefined && limit === 0) return [];
        // If `separator` is not a regex, use native split
        if (!_isRegexp(separator)) return $split.call(string, separator, limit);
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;
        while (match = _regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy[LAST_INDEX$1];
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
            lastLength = match[0][LENGTH];
            lastLastIndex = lastIndex;
            if (output[LENGTH] >= splitLimit) break;
          }
          if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
        }
        if (lastLastIndex === string[LENGTH]) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
      };
    // Chakra, V8
    } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
      };
    } else {
      internalSplit = $split;
    }

    return [
      // `String.prototype.split` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = defined(this);
        var splitter = separator == undefined ? undefined : separator[SPLIT];
        return splitter !== undefined
          ? splitter.call(separator, O, limit)
          : internalSplit.call(String(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (regexp, limit) {
        var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
        if (res.done) return res.value;

        var rx = _anObject(regexp);
        var S = String(this);
        var C = _speciesConstructor(rx, RegExp);

        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') +
                    (rx.multiline ? 'm' : '') +
                    (rx.unicode ? 'u' : '') +
                    (SUPPORTS_Y ? 'y' : 'g');

        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = SUPPORTS_Y ? q : 0;
          var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
          var e;
          if (
            z === null ||
            (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
          ) {
            q = _advanceStringIndex(S, q, unicodeMatching);
          } else {
            A.push(S.slice(p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              A.push(z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        A.push(S.slice(p));
        return A;
      }
    ];
  });

  var Path = {
    moveTo_lineTo: {
      config: {
        x: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        y: {
          value: 10,
          min: 0,
          max: 500,
          step: 1
        },
        lineWidth: {
          value: 10,
          min: 0,
          max: 20,
          step: 1
        },
        lineCap: {
          value: 'butt',
          values: ['butt', 'round', 'square']
        },
        lineJoin: {
          value: 'miter',
          values: ['round', 'bevel', 'miter']
        },
        miterLimit: {
          value: 10,
          min: 0,
          max: 30,
          step: 1
        },
        lineDash: '',
        lineDashOffset: {
          value: 0,
          min: -100,
          max: 100,
          step: 1
        },
        strokeStyle: {
          color: randomColor()
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.strokeStyle = config.strokeStyle.color;
        ctx.lineWidth = config.lineWidth.value;
        ctx.lineCap = config.lineCap.value;
        ctx.lineJoin = config.lineJoin.value;
        ctx.miterLimit = config.miterLimit.value;
        var lineDash = config.lineDash.split(',');

        if (lineDash.length > 1) {
          ctx.setLineDash(lineDash);
        }

        ctx.lineDashOffset = config.lineDashOffset.value;
        ctx.beginPath();
        ctx.moveTo(config.x.value, config.y.value);
        ctx.lineTo(300, 210);
        ctx.lineTo(100, 210);
        ctx.lineTo(200, 10);
        ctx.moveTo(100, 100);
        ctx.lineTo(200, 100);
        ctx.stroke();
      }
    },
    closePath: {
      config: {
        lineWidth: {
          value: 5,
          min: 0,
          max: 10,
          step: 1
        },
        strokeStyle: {
          color: randomColor()
        },
        closePath: true
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.strokeStyle = config.strokeStyle.color;
        ctx.lineWidth = config.lineWidth.value;
        ctx.beginPath();
        ctx.moveTo(200, 10);
        ctx.lineTo(300, 210);
        ctx.lineTo(100, 210);

        if (config.closePath) {
          ctx.closePath();
        }

        ctx.stroke();
      }
    },
    fill: {
      config: {
        fillStyle: {
          color: randomColor()
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.fillStyle = config.fillStyle.color;
        ctx.beginPath();
        ctx.moveTo(200, 10);
        ctx.lineTo(300, 210);
        ctx.lineTo(100, 210);
        ctx.fill();
      }
    },
    fill_stroke: {
      config: {
        lineWidth: {
          value: 5,
          min: 0,
          max: 10,
          step: 1
        },
        strokeStyle: {
          color: randomColor()
        },
        fillStyle: {
          color: randomColor()
        },
        fill: true,
        stroke: true
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.fillStyle = config.fillStyle.color;
        ctx.strokeStyle = config.strokeStyle.color;
        ctx.lineWidth = config.lineWidth.value;
        ctx.beginPath();
        ctx.moveTo(200, 10);
        ctx.lineTo(300, 210);
        ctx.lineTo(100, 210);

        if (config.fill) {
          ctx.fill();
        }

        if (config.stroke) {
          ctx.stroke();
        }
      }
    },
    stroke_fill: {
      config: {
        lineWidth: {
          value: 5,
          min: 0,
          max: 10,
          step: 1
        },
        strokeStyle: {
          color: randomColor()
        },
        fillStyle: {
          color: randomColor()
        },
        fill: true,
        stroke: true
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.fillStyle = config.fillStyle.color;
        ctx.strokeStyle = config.strokeStyle.color;
        ctx.lineWidth = config.lineWidth.value;
        ctx.beginPath();
        ctx.moveTo(200, 10);
        ctx.lineTo(300, 210);
        ctx.lineTo(100, 210);

        if (config.stroke) {
          ctx.stroke();
        }

        if (config.fill) {
          ctx.fill();
        }
      }
    },
    without_beginPath: function without_beginPath(ctx) {
      ctx.strokeStyle = randomColor();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(200, 10);
      ctx.lineTo(300, 210);
      ctx.lineTo(100, 210);
      ctx.stroke();
      setTimeout(function () {
        ctx.strokeStyle = randomColor();
        ctx.rect(10, 10, 100, 100);
        ctx.stroke();
      }, 2000);
    },
    with_beginPath: function with_beginPath(ctx) {
      ctx.strokeStyle = randomColor();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(200, 10);
      ctx.lineTo(300, 210);
      ctx.lineTo(100, 210);
      ctx.stroke();
      setTimeout(function () {
        ctx.strokeStyle = randomColor();
        ctx.beginPath();
        ctx.rect(10, 10, 100, 100);
        ctx.stroke();
      }, 2000);
    },
    curve: {
      config: {
        color: {
          color: randomColor()
        },
        cpx: {
          value: 160,
          min: 0,
          max: 500,
          step: 1
        },
        cpy: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        cp1x: {
          value: 85,
          min: 0,
          max: 500,
          step: 1
        },
        cp1y: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        cp2x: {
          value: 235,
          min: 0,
          max: 500,
          step: 1
        },
        cp2y: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.strokeStyle = config.color.color;
        ctx.beginPath();
        var p1 = {
          x: 10,
          y: 100
        };
        var p2 = {
          x: 310,
          y: 100
        };
        var cpx = config.cpx,
            cpy = config.cpy,
            cp1x = config.cp1x,
            cp1y = config.cp1y,
            cp2x = config.cp2x,
            cp2y = config.cp2y;
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cpx.value, cpy.value, p2.x, p2.y);
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(cp1x.value, cp1y.value, cp2x.value, cp2y.value, p2.x, p2.y);
        ctx.stroke();
        drawControlPoint(ctx, cpx.value, cpy.value);
        drawControlPoint(ctx, cp1x.value, cp1y.value);
        drawControlPoint(ctx, cp2x.value, cp2y.value);
      }
    },
    arcTo: {
      config: {
        color1: {
          color: randomColor()
        },
        color2: {
          color: randomColor()
        },
        x0: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        y0: {
          value: 50,
          min: 0,
          max: 500,
          step: 1
        },
        x1: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        y1: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        x2: {
          value: 0,
          min: 0,
          max: 500,
          step: 1
        },
        y2: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        radius: {
          value: 100,
          min: 0,
          max: 500,
          step: 1
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.lineWidth = 3;
        ctx.strokeStyle = config.color1.color;
        ctx.beginPath();
        ctx.arc(100, 100, 100, 0, Math.PI * 2);
        ctx.rect(0, 0, 200, 200);
        ctx.stroke();
        ctx.strokeStyle = config.color2.color;
        ctx.beginPath();
        var x0 = config.x0,
            y0 = config.y0,
            x1 = config.x1,
            y1 = config.y1,
            x2 = config.x2,
            y2 = config.y2,
            radius = config.radius;
        ctx.moveTo(x0.value, y0.value); // x1, y1, x2, y2, radius

        ctx.arcTo(x1.value, y1.value, x2.value, y2.value, radius.value);
        ctx.lineTo(150, 200);
        ctx.stroke();
        drawControlPoint(ctx, x0.value, y0.value);
        drawControlPoint(ctx, x1.value, y1.value);
        drawControlPoint(ctx, x2.value, y2.value);
      }
    },
    arc: {
      config: {
        color: {
          color: randomColor()
        },
        cx: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        cy: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        radius: {
          value: 80,
          min: 0,
          max: 500,
          step: 1
        },
        startAngle: {
          value: 0,
          min: -360,
          max: 360,
          step: 1
        },
        endAngle: {
          value: 90,
          min: -360,
          max: 360,
          step: 1
        },
        anticlockwise: true
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.strokeStyle = config.color.color;
        ctx.beginPath();
        var cx = config.cx,
            cy = config.cy,
            radius = config.radius,
            startAngle = config.startAngle,
            endAngle = config.endAngle,
            anticlockwise = config.anticlockwise;
        ctx.moveTo(cx.value, cy.value); // x, y, radius, startAngle, endAngle, anticlockwise

        ctx.arc(cx.value, cy.value, radius.value, toRadians(startAngle.value), toRadians(endAngle.value), anticlockwise);
        ctx.stroke();
        drawControlPoint(ctx, cx.value, cy.value);
      }
    },
    arc_without_subpath: function arc_without_subpath(ctx) {
      ctx.strokeStyle = randomColor();
      ctx.beginPath();
      ctx.arc(300, 300, 80, 0, Math.PI * 2);
      ctx.moveTo(20, 100); // x, y, radius, startAngle, endAngle, anticlockwise

      ctx.arc(100, 100, 80, Math.PI / 2, Math.PI, false);
      ctx.moveTo(300, 180);
      ctx.arc(300, 100, 80, Math.PI / 2, Math.PI, false);
      ctx.arc(100, 300, 80, 0, Math.PI * 2);
      ctx.stroke();
    },
    ellipse: {
      config: {
        color: {
          color: randomColor()
        },
        cx: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        cy: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        radiusX: {
          value: 100,
          min: 0,
          max: 500,
          step: 1
        },
        radiusY: {
          value: 60,
          min: 0,
          max: 500,
          step: 1
        },
        rotation: {
          value: 15,
          min: -360,
          max: 360,
          step: 1
        },
        startAngle: {
          value: 0,
          min: -360,
          max: 360,
          step: 1
        },
        endAngle: {
          value: 360,
          min: -360,
          max: 360,
          step: 1
        },
        anticlockwise: false
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.strokeStyle = config.color.color;
        ctx.beginPath();
        var cx = config.cx,
            cy = config.cy,
            radiusX = config.radiusX,
            radiusY = config.radiusY,
            rotation = config.rotation,
            startAngle = config.startAngle,
            endAngle = config.endAngle,
            anticlockwise = config.anticlockwise;
        ctx.moveTo(cx.value, cy.value); // x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise

        ctx.ellipse(cx.value, cy.value, radiusX.value, radiusY.value, toRadians(rotation.value), toRadians(startAngle.value), toRadians(endAngle.value), anticlockwise);
        ctx.stroke();
        drawControlPoint(ctx, cx.value, cy.value);
      }
    },
    rect: function rect(ctx) {
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(200, 20);
      ctx.rect(30, 10, 100, 200);
      ctx.strokeStyle = randomColor();
      ctx.strokeRect(100, 50, 100, 100);
      ctx.lineTo(300, 300);
      ctx.strokeStyle = randomColor();
      ctx.stroke();
    },
    clip: {
      config: {
        clipRect: true,
        clipCircle: true,
        clipTwoShape: false,
        color: {
          color: randomColor()
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.save();

        if (config.clipTwoShape) {
          if (config.clipRect || config.clipCircle) {
            ctx.beginPath();

            if (config.clipRect) {
              ctx.rect(20, 20, 60, 60);
            }

            if (config.clipCircle) {
              ctx.arc(70, 70, 50, 0, Math.PI * 2);
            }

            ctx.clip();
          }
        } else {
          if (config.clipRect) {
            ctx.beginPath();
            ctx.rect(20, 20, 60, 60);
            ctx.clip();
          }

          if (config.clipCircle) {
            ctx.beginPath();
            ctx.arc(70, 70, 50, 0, Math.PI * 2);
            ctx.clip();
          }
        }

        ctx.beginPath();
        ctx.fillStyle = config.color.color;
        ctx.rect(0, 0, 100, 100);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(0, 0, 100, 100);
        ctx.restore();
      }
    },
    path2d: {
      config: {
        fillStyle: {
          color: randomColor()
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.fillStyle = config.fillStyle.color;
        var path2d = new Path2D();
        path2d.moveTo(200, 10);
        path2d.lineTo(300, 210);
        path2d.lineTo(100, 210);
        ctx.fill(path2d);
      }
    },
    roundRect: {
      config: {
        color: {
          color: randomColor()
        },
        radius: {
          value: 5,
          min: 0,
          max: 20,
          step: 1
        }
      },
      draw: function draw() {
        function roundedRect(ctx, x, y, width, height, radius) {
          ctx.beginPath();
          ctx.moveTo(x, y + radius);
          ctx.lineTo(x, y + height - radius);
          ctx.arcTo(x, y + height, x + radius, y + height, radius);
          ctx.lineTo(x + width - radius, y + height);
          ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
          ctx.lineTo(x + width, y + radius);
          ctx.arcTo(x + width, y, x + width - radius, y, radius);
          ctx.lineTo(x + radius, y);
          ctx.arcTo(x, y, x, y + radius, radius);
          ctx.stroke();
        }

        var ctx = this.ctx,
            config = this.config;
        ctx.strokeStyle = config.color.color;
        ctx.lineWidth = 2;
        roundedRect(ctx, 50, 50, 250, 150, config.radius.value);
      }
    }
  };

  var Text = {
    text: {
      config: {
        x: {
          value: 10,
          min: 0,
          max: 500,
          step: 10
        },
        y: {
          value: 50,
          min: 0,
          max: 500,
          step: 10
        },
        font: '50px Arial',
        fillStyle: {
          color: randomColor()
        },
        strokeStyle: {
          color: randomColor()
        },
        textAlign: {
          value: 'left',
          values: ['start', 'end', 'left', 'right', 'center']
        },
        textBaseline: {
          value: 'top',
          values: ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']
        },
        text: 'AfghijpqyZ'
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.font = config.font;
        ctx.fillStyle = config.fillStyle.color;
        ctx.strokeStyle = config.strokeStyle.color;
        ctx.textAlign = config.textAlign.value;
        ctx.textBaseline = config.textBaseline.value;
        var size = ctx.measureText(config.text);
        var height = ctx.measureText('e').width * 2; // text, x, y, maxWidth

        ctx.fillText(config.text, config.x.value, config.y.value);
        ctx.strokeRect(config.x.value, config.y.value, size.width, height);
        ctx.strokeText(config.text, config.x.value, config.y.value + 100);
        ctx.strokeRect(config.x.value, config.y.value + 100, size.width, height); // text base point

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(config.x.value, config.y.value, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  var Other = {
    transformations: {
      config: {
        x: {
          value: 100,
          min: -500,
          max: 500,
          step: 1
        },
        y: {
          value: 100,
          min: -500,
          max: 500,
          step: 1
        },
        sx1: {
          value: 1.5,
          min: -5,
          max: 5,
          step: 0.1
        },
        sy1: {
          value: 1,
          min: -5,
          max: 5,
          step: 0.1
        },
        sx2: {
          value: 1,
          min: -5,
          max: 5,
          step: 0.1
        },
        sy2: {
          value: 1,
          min: -5,
          max: 5,
          step: 0.1
        },
        rotation: {
          value: 25,
          min: -360,
          max: 360,
          step: 1
        },
        shadowColor: {
          color: randomColor()
        },
        shadowOffsetX: {
          value: 7,
          min: -30,
          max: 30,
          step: 1
        },
        shadowOffsetY: {
          value: 15,
          min: -30,
          max: 30,
          step: 1
        },
        shadowBlur: {
          value: 15,
          min: 0,
          max: 100,
          step: 1
        },
        lineWidth: {
          value: 5,
          min: 0,
          max: 10,
          step: 1
        },
        strokeStyle: {
          color: randomColor()
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        var x = config.x,
            y = config.y,
            sx1 = config.sx1,
            sy1 = config.sy1,
            sx2 = config.sx2,
            sy2 = config.sy2,
            rotation = config.rotation;
        ctx.strokeStyle = config.strokeStyle.color;
        ctx.lineWidth = config.lineWidth.value;
        ctx.shadowColor = config.shadowColor.color;
        ctx.shadowOffsetX = config.shadowOffsetX.value;
        ctx.shadowOffsetY = config.shadowOffsetY.value;
        ctx.shadowBlur = config.shadowBlur.value;
        ctx.translate(x.value, y.value);
        ctx.scale(sx1.value, sy1.value);
        ctx.scale(sx2.value, sy2.value);
        ctx.rotate(toRadians(rotation.value));
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, 50);
        ctx.moveTo(0, 20);
        ctx.lineTo(20, 20);
        ctx.stroke();
      }
    },
    linearGradient: {
      config: {
        x0: {
          value: 100,
          min: 0,
          max: 500,
          step: 1
        },
        y0: {
          value: 100,
          min: 0,
          max: 500,
          step: 1
        },
        x1: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        y1: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        color1: {
          color: randomColor()
        },
        color2: {
          color: randomColor()
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        var x0 = config.x0,
            y0 = config.y0,
            x1 = config.x1,
            y1 = config.y1; // x0, y0, x1, y1

        var linearGradient = ctx.createLinearGradient(x0.value, y0.value, x1.value, y1.value);
        linearGradient.addColorStop(0, config.color1.color);
        linearGradient.addColorStop(1, config.color2.color);
        ctx.fillStyle = linearGradient;
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        ctx.fill();
        ctx.strokeRect(x0.value, y0.value, x1.value - x0.value, y1.value - y0.value);
      }
    },
    radialGradient: {
      config: {
        x0: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        y0: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        r0: {
          value: 0,
          min: 0,
          max: 500,
          step: 1
        },
        x1: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        y1: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        r1: {
          value: 200,
          min: 0,
          max: 500,
          step: 1
        },
        color1: {
          color: randomColor()
        },
        color2: {
          color: randomColor()
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        var x0 = config.x0,
            y0 = config.y0,
            r0 = config.r0,
            x1 = config.x1,
            y1 = config.y1,
            r1 = config.r1; // x0, y0, r0, x1, y1, r1

        var radialGradient = ctx.createRadialGradient(x0.value, y0.value, r0.value, x1.value, y1.value, r1.value);
        radialGradient.addColorStop(0, config.color1.color);
        radialGradient.addColorStop(1, config.color2.color);
        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        ctx.fill();
        ctx.strokeRect(x1.value - r1.value, y1.value - r1.value, r1.value * 2, r1.value * 2);
      }
    },
    pattern: {
      config: {
        color: {
          color: randomColor()
        },
        x: {
          value: 0,
          min: 0,
          max: 400,
          step: 1
        },
        y: {
          value: 0,
          min: 0,
          max: 400,
          step: 1
        },
        w: {
          value: 400,
          min: 0,
          max: 400,
          step: 1
        },
        h: {
          value: 200,
          min: 0,
          max: 400,
          step: 1
        },
        repetition: {
          value: 'repeat',
          values: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']
        },
        useCanvas: false,
        imageBitmap: true,
        toDataURL: function toDataURL() {
          var a = document.createElement('a');
          a.href = this.canvas.toDataURL();
          a.download = 'canvas.png';
          a.click();
        },
        toBlob: function toBlob() {
          this.canvas.toBlob(function (blob) {
            var a = document.createElement('a');
            var url = URL.createObjectURL(blob);
            a.href = url;
            a.download = 'canvas.png';
            a.click();
            URL.revokeObjectURL(url);
          });
        }
      },
      before: function before() {
        this.config.canvas = this.ctx.canvas;
      },
      draw: function () {
        var _draw = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          var ctx, config, x, y, w, h, image, textureCanvas, textureCtx, pattern;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  ctx = this.ctx, config = this.config;
                  x = config.x, y = config.y, w = config.w, h = config.h;

                  if (!config.useCanvas) {
                    _context.next = 20;
                    break;
                  }

                  textureCanvas = document.createElement('canvas');
                  textureCanvas.width = 40;
                  textureCanvas.height = 40;
                  textureCtx = textureCanvas.getContext('2d');
                  textureCtx.save();
                  textureCtx.lineWidth = 1;
                  textureCtx.strokeStyle = config.color.color;
                  textureCtx.beginPath();
                  textureCtx.moveTo(30, 10);
                  textureCtx.lineTo(10, 30);
                  textureCtx.moveTo(10, 10);
                  textureCtx.lineTo(30, 30);
                  textureCtx.stroke();
                  textureCtx.restore();
                  image = textureCanvas;
                  _context.next = 29;
                  break;

                case 20:
                  if (!config.imageBitmap) {
                    _context.next = 26;
                    break;
                  }

                  _context.next = 23;
                  return loadImageBitmap('./images/Canvas_createpattern.png');

                case 23:
                  image = _context.sent;
                  _context.next = 29;
                  break;

                case 26:
                  _context.next = 28;
                  return loadImage('./images/Canvas_createpattern.png');

                case 28:
                  image = _context.sent;

                case 29:
                  pattern = ctx.createPattern(image, config.repetition.value);
                  ctx.fillStyle = pattern;
                  ctx.beginPath();
                  ctx.rect(x.value, y.value, w.value, h.value);
                  ctx.fill();
                  ctx.strokeRect(x.value, y.value, w.value, h.value);

                case 35:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function draw() {
          return _draw.apply(this, arguments);
        }

        return draw;
      }()
    },
    drawImage: {
      config: {
        sx: {
          value: 0,
          min: 0,
          max: 400,
          step: 1
        },
        sy: {
          value: 0,
          min: 0,
          max: 400,
          step: 1
        },
        sw: {
          value: 86,
          min: 0,
          max: 400,
          step: 1
        },
        sh: {
          value: 117,
          min: 0,
          max: 400,
          step: 1
        },
        dx: {
          value: 0,
          min: 0,
          max: 400,
          step: 1
        },
        dy: {
          value: 0,
          min: 0,
          max: 400,
          step: 1
        },
        dw: {
          value: 86,
          min: 0,
          max: 400,
          step: 1
        },
        dh: {
          value: 117,
          min: 0,
          max: 400,
          step: 1
        }
      },
      draw: function () {
        var _draw2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2() {
          var ctx, config, sx, sy, sw, sh, dx, dy, dw, dh, image, color;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  ctx = this.ctx, config = this.config;
                  sx = config.sx, sy = config.sy, sw = config.sw, sh = config.sh, dx = config.dx, dy = config.dy, dw = config.dw, dh = config.dh;
                  image = this.image, color = this.color;

                  if (image) {
                    _context2.next = 8;
                    break;
                  }

                  _context2.next = 6;
                  return loadImageBitmap('./images/Canvas_createpattern.png');

                case 6:
                  image = _context2.sent;
                  this.image = image;

                case 8:
                  if (!color) {
                    color = randomColor();
                    this.color = color;
                  }

                  ctx.fillStyle = color;
                  ctx.font = '20px Arial'; // image, dx, dy

                  ctx.drawImage(image, dx.value, dy.value); // image, dx, dy, dw, dh

                  ctx.drawImage(image, dx.value + 150, dy.value, dw.value, dh.value); // image, sx, sy, sw, sh, dx, dy, dw, dh

                  ctx.drawImage(image, sx.value, sy.value, sw.value, sh.value, dx.value + 300, dy.value, dw.value, dh.value);
                  ctx.fillText('(image, dx, dy)', dx.value, dy.value + 130);
                  ctx.fillText('(image, dx, dy, dw, dh)', dx.value + 150, dy.value + 150);
                  ctx.textAlign = 'right';
                  ctx.fillText('(image, sx, sy, sw, sh, dx, dy, dw, dh)', dx.value + 300 + 86, dy.value + 170);

                case 18:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function draw() {
          return _draw2.apply(this, arguments);
        }

        return draw;
      }()
    },
    globalAlpha: {
      config: {
        color: {
          color: randomColor()
        },
        globalAlpha: {
          value: 1,
          min: 0,
          max: 1,
          step: 0.1
        },
        alpha: {
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.1
        }
      },
      draw: function () {
        var _draw3 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3() {
          var ctx, config, image, color;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  ctx = this.ctx, config = this.config;
                  ctx.globalAlpha = config.globalAlpha.value;
                  ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                  image = this.image;

                  if (image) {
                    _context3.next = 9;
                    break;
                  }

                  _context3.next = 7;
                  return loadImageBitmap('./images/Canvas_createpattern.png');

                case 7:
                  image = _context3.sent;
                  this.image = image;

                case 9:
                  ctx.drawImage(this.image, 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                  color = getColorValue(config.color.color);
                  color.a = config.alpha.value;
                  ctx.fillStyle = color;
                  ctx.beginPath();
                  ctx.arc(100, 100, 50, 0, Math.PI * 2);
                  ctx.fill();

                case 16:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function draw() {
          return _draw3.apply(this, arguments);
        }

        return draw;
      }()
    },
    imageData: {
      config: {
        color: {
          color: randomColor()
        }
      },
      draw: function () {
        var _draw4 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4() {
          var ctx, config, image;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  ctx = this.ctx, config = this.config;
                  image = this.image;

                  if (image) {
                    _context4.next = 7;
                    break;
                  }

                  _context4.next = 5;
                  return loadImageBitmap('./images/Canvas_createpattern.png');

                case 5:
                  image = _context4.sent;
                  this.image = image;

                case 7:
                  image = getColorImage(image, config.color.color);
                  ctx.drawImage(image, 50, 50, image.width, image.height);

                case 9:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function draw() {
          return _draw4.apply(this, arguments);
        }

        return draw;
      }()
    },
    svg: {
      config: {
        scale: {
          value: 0.5,
          min: 0.1,
          max: 5,
          step: 0.1
        }
      },
      draw: function () {
        var _draw5 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee5() {
          var ctx, config, image;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  ctx = this.ctx, config = this.config;
                  ctx.translate(ctx.canvas.clientWidth / 2, ctx.canvas.clientHeight / 2);
                  ctx.scale(config.scale.value, config.scale.value);
                  image = this.image;

                  if (image) {
                    _context5.next = 9;
                    break;
                  }

                  _context5.next = 7;
                  return loadImage('./images/save-money.svg');

                case 7:
                  image = _context5.sent;
                  this.image = image;

                case 9:
                  ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);

                case 10:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function draw() {
          return _draw5.apply(this, arguments);
        }

        return draw;
      }()
    },
    globalCompositeOperation: {
      config: {
        globalCompositeOperation: {
          value: 'source-over',
          values: ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']
        },
        color: {
          color: randomColor()
        },
        alpha: {
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.1
        }
      },
      draw: function () {
        var _draw6 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee6() {
          var ctx, config, image, color;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  ctx = this.ctx, config = this.config;
                  ctx.save();
                  ctx.translate(ctx.canvas.clientWidth / 2, ctx.canvas.clientHeight / 2);
                  ctx.scale(0.5, 0.5);
                  image = this.image;

                  if (image) {
                    _context6.next = 10;
                    break;
                  }

                  _context6.next = 8;
                  return loadImage('./images/save-money.svg');

                case 8:
                  image = _context6.sent;
                  this.image = image;

                case 10:
                  ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
                  ctx.restore();
                  ctx.save();
                  ctx.globalCompositeOperation = config.globalCompositeOperation.value;
                  color = getColorValue(config.color.color);
                  color.a = config.alpha.value;
                  ctx.fillStyle = color;
                  ctx.fillRect(100, 100, 200, 200);
                  ctx.restore();

                case 19:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        function draw() {
          return _draw6.apply(this, arguments);
        }

        return draw;
      }()
    },
    animation: {
      clear: false,
      config: {
        radius: {
          value: 5,
          min: 0,
          max: 400,
          step: 1
        },
        color: {
          color: randomColor()
        }
      },
      clearCanvas: function clearCanvas() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      },
      before: function before() {
        var _this = this;

        this.clearCanvas();

        this.handleMouseMove = function (e) {
          _this.point = getPointAt(_this.ctx.canvas, e);
        };

        this.ctx.canvas.addEventListener('mousemove', this.handleMouseMove);
      },
      after: function after() {
        if (this.animation) {
          cancelAnimationFrame(this.animation);
        }

        this.clearCanvas();
        this.ctx.canvas.removeEventListener('mousemove', this.handleMouseMove);
      },
      draw: function draw() {
        var _this2 = this;

        var ctx = this.ctx,
            config = this.config;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = config.color.color;

        if (this.point) {
          ctx.beginPath();
          ctx.arc(this.point.x, this.point.y, config.radius.value, 0, Math.PI * 2);
          ctx.fill();
        }

        this.animation = requestAnimationFrame(function () {
          _this2.draw();
        });
      }
    },
    test: {
      config: {
        radius: {
          value: 50,
          min: 0,
          max: 400,
          step: 1
        }
      },
      draw: function draw() {
        var ctx = this.ctx,
            config = this.config;
        ctx.beginPath();
        ctx.arc(100, 100, config.radius.value, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  var modules = {
    Clear: Clear,
    Path: Path,
    Text: Text,
    Other: Other
  };
  var codes = {};
  Object.keys(modules).forEach(function (moduleName) {
    var module = modules[moduleName];
    Object.keys(module).forEach(function (methodName) {
      var method = module[methodName];
      codes["".concat(moduleName, "_").concat(methodName)] = method;
    });
  });
  var canvas = document.getElementById('canvas');
  var lessons = document.getElementById('lessons');
  var code = document.getElementById('code');
  var ctx = canvas.getContext('2d');
  window.ctx = ctx;
  toHighDPI(canvas);

  function addOption(lessonName) {
    var option = document.createElement('option');
    option.value = lessonName;
    option.innerHTML = lessonName;
    lessons.add(option);
  }

  var lastSelected;

  function run$1() {
    return _run.apply(this, arguments);
  }

  function _run() {
    _run = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var method, gui;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (lessons.value) {
                _context.next = 3;
                break;
              }

              ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
              return _context.abrupt("return");

            case 3:
              if (lastSelected && lastSelected.gui) {
                lastSelected.gui.destroy();
              }

              if (lastSelected && lastSelected.after) {
                lastSelected.after();
              }

              method = codes[lessons.value];
              lastSelected = method;

              if (method.clear !== false) {
                ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                ctx.save();
              }

              if (!method.draw) {
                _context.next = 15;
                break;
              }

              method.ctx = ctx;

              if (method.config) {
                gui = new GUI$1();
                method.gui = gui;
                Object.keys(method.config).forEach(function (key) {
                  var controller;
                  var value = method.config[key];

                  if (value.min || value.max) {
                    controller = gui.add(value, 'value', value.min, value.max, value.step);
                  } else if (value.values) {
                    controller = gui.add(value, 'value', value.values);
                  } else if (value.color) {
                    controller = gui.addColor(value, 'color');
                  } else {
                    controller = gui.add(method.config, key);
                  }

                  controller.name(key);

                  if (!(method.config[key] instanceof Function)) {
                    controller.onChange(function () {
                      ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
                      ctx.save();
                      method.draw();
                      ctx.restore();
                    });
                  }
                });
              }

              _context.next = 13;
              return method.draw();

            case 13:
              _context.next = 16;
              break;

            case 15:
              method(ctx);

            case 16:
              if (method.clear !== false) {
                ctx.restore();
              }

              if (method.before) {
                method.before();
              }

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _run.apply(this, arguments);
  }

  addOption('');
  Object.keys(codes).forEach(function (lessonName) {
    addOption(lessonName);
  });

  function setLesson(lesson) {
    lessons.value = lesson;

    if (!lessons.value) {
      code.value = '';
      document.title = 'Canvas lessions';
    } else {
      var method = codes[lessons.value];
      code.value = method.draw || method;
      document.title = "Canvas lessions - ".concat(lessons.value);
    }

    run$1();
  } // https://caniuse.com/#search=URLSearchParams
  // https://davidwalsh.name/query-string-javascript
  // https://usefulangle.com/post/81/javascript-change-url-parameters
  // https://github.com/ungap/url-search-params


  var urlParams = new URLSearchParams(window.location.search);
  var initLession = urlParams.get('lesson') || '';

  if (initLession) {
    setLesson(initLession);
  }

  lessons.addEventListener('change', function () {
    // https://developer.mozilla.org/en-US/docs/Web/API/History_API
    // https://caniuse.com/#search=history
    // https://css-tricks.com/using-the-html5-history-api/
    urlParams.set('lesson', lessons.value);
    window.history.pushState({
      value: lessons.value
    }, null, "?".concat(urlParams.toString()));
    setLesson(lessons.value);
  });
  window.addEventListener('popstate', function (e) {
    var lesson = e.state && e.state.value || initLession;
    setLesson(lesson);
  });

}());
