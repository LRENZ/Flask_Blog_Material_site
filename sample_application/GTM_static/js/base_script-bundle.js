//javascript/closure/base.js
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 * @author pupius@google.com (Dan Pupius)
 * @author arv@google.com (Erik Arvidsson)
 *
 * @provideGoog
 */


/**
 * @define {boolean} Overridden to true by the compiler when
 *     --process_closure_primitives is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is already
 * defined in the current scope before assigning to prevent clobbering if
 * base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * A hook for overriding the define values in uncompiled mode.
 *
 * In uncompiled mode, {@code CLOSURE_UNCOMPILED_DEFINES} may be defined before
 * loading base.js.  If a key is defined in {@code CLOSURE_UNCOMPILED_DEFINES},
 * {@code goog.define} will use the value instead of the default value.  This
 * allows flags to be overwritten without compilation (this is normally
 * accomplished with the compiler's "define" flag).
 *
 * Example:
 * <pre>
 *   var CLOSURE_UNCOMPILED_DEFINES = {'goog.DEBUG': false};
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_UNCOMPILED_DEFINES;


/**
 * A hook for overriding the define values in uncompiled or compiled mode,
 * like CLOSURE_UNCOMPILED_DEFINES but effective in compiled code.  In
 * uncompiled code CLOSURE_UNCOMPILED_DEFINES takes precedence.
 *
 * Also unlike CLOSURE_UNCOMPILED_DEFINES the values must be number, boolean or
 * string literals or the compiler will emit an error.
 *
 * While any @define value may be set, only those set with goog.define will be
 * effective for uncompiled code.
 *
 * Example:
 * <pre>
 *   var CLOSURE_DEFINES = {'goog.DEBUG': false} ;
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_DEFINES;


/**
 * Returns true if the specified value is not undefined.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  // void 0 always evaluates to undefined and hence we do not need to depend on
  // the definition of the global variable named 'undefined'.
  return val !== void 0;
};


/**
 * Builds an object structure for the provided namespace path, ensuring that
 * names that already exist are not overwritten. For example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Defines a named value. In uncompiled mode, the value is retrieved from
 * CLOSURE_DEFINES or CLOSURE_UNCOMPILED_DEFINES if the object is defined and
 * has the property specified, and otherwise used the defined defaultValue.
 * When compiled the default can be overridden using the compiler
 * options or the value set in the CLOSURE_DEFINES object.
 *
 * @param {string} name The distinguished name to provide.
 * @param {string|number|boolean} defaultValue
 */
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_UNCOMPILED_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
      value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
    } else if (goog.global.CLOSURE_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.define('goog.DEBUG', true);


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.define('goog.LOCALE', 'en');  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your JavaScript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
 */
goog.define('goog.TRUSTED_SITE', true);


/**
 * @define {boolean} Whether a project is expected to be running in strict mode.
 *
 * This define can be used to trigger alternate implementations compatible with
 * running in EcmaScript Strict mode or warn about unavailable functionality.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
 *
 */
goog.define('goog.STRICT_MODE_COMPATIBLE', false);


/**
 * @define {boolean} Whether code that calls {@link goog.setTestOnly} should
 *     be disallowed in the compilation unit.
 */
goog.define('goog.DISALLOW_TEST_ONLY_CODE', COMPILED && !goog.DEBUG);


/**
 * @define {boolean} Whether to use a Chrome app CSP-compliant method for
 *     loading scripts via goog.require. @see appendScriptSrcNode_.
 */
goog.define('goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING', false);


/**
 * Defines a namespace in Closure.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * The presence of one or more goog.provide() calls in a file indicates
 * that the file defines the given objects/namespaces.
 * Provided symbols must not be null or undefined.
 *
 * In addition, goog.provide() creates the object stubs for a namespace
 * (for example, goog.provide("goog.foo.bar") will create the object
 * goog.foo.bar if it does not already exist).
 *
 * Build tools also scan for provide/require/module statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 *
 * @see goog.require
 * @see goog.module
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
  }

  goog.constructNamespace_(name);
};


/**
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 * @param {Object=} opt_obj The object to embed in the namespace.
 * @private
 */
goog.constructNamespace_ = function(name, opt_obj) {
  if (!COMPILED) {
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name, opt_obj);
};


/**
 * Module identifier validation regexp.
 * Note: This is a conservative check, it is very possible to be more lenient,
 *   the primary exclusion here is "/" and "\" and a leading ".", these
 *   restrictions are intended to leave the door open for using goog.require
 *   with relative file paths rather than module identifiers.
 * @private
 */
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;


/**
 * Defines a module in Closure.
 *
 * Marks that this file must be loaded as a module and claims the namespace.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * goog.module() has three requirements:
 * - goog.module may not be used in the same file as goog.provide.
 * - goog.module must be the first statement in the file.
 * - only one goog.module is allowed per file.
 *
 * When a goog.module annotated file is loaded, it is enclosed in
 * a strict function closure. This means that:
 * - any variables declared in a goog.module file are private to the file
 * (not global), though the compiler is expected to inline the module.
 * - The code must obey all the rules of "strict" JavaScript.
 * - the file will be marked as "use strict"
 *
 * NOTE: unlike goog.provide, goog.module does not declare any symbols by
 * itself. If declared symbols are desired, use
 * goog.module.declareLegacyNamespace().
 *
 * MOE:begin_intracomment_strip
 * See the goog.module announcement at http://go/goog.module-announce
 * MOE:end_intracomment_strip
 *
 * See the public goog.module proposal: http://goo.gl/Va1hin
 *
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part", is expected but not required.
 */
goog.module = function(name) {
  if (!goog.isString(name) ||
      !name ||
      name.search(goog.VALID_MODULE_RE_) == -1) {
    throw Error('Invalid module identifier');
  }
  if (!goog.isInModuleLoader_()) {
    throw Error('Module ' + name + ' has been loaded incorrectly.');
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error('goog.module may only be called once per module.');
  }

  // Store the module name for the loader.
  goog.moduleLoaderState_.moduleName = name;
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
  }
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 *
 * Note: This is not an alternative to goog.require, it does not
 * indicate a hard dependency, instead it is used to indicate
 * an optional dependency or to access the exports of a module
 * that has already been loaded.
 * @suppress {missingProvide}
 */
goog.module.get = function(name) {
  return goog.module.getInternal_(name);
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 * @private
 */
goog.module.getInternal_ = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      // goog.require only return a value with-in goog.module files.
      return name in goog.loadedModules_ ?
          goog.loadedModules_[name] :
          goog.getObjectByName(name);
    } else {
      return null;
    }
  }
};


/**
 * @private {?{moduleName: (string|undefined), declareLegacyNamespace:boolean}}
 */
goog.moduleLoaderState_ = null;


/**
 * @private
 * @return {boolean} Whether a goog.module is currently being initialized.
 */
goog.isInModuleLoader_ = function() {
  return goog.moduleLoaderState_ != null;
};


/**
 * Provide the module's exports as a globally accessible object under the
 * module's declared name.  This is intended to ease migration to goog.module
 * for files that have existing usages.
 * @suppress {missingProvide}
 */
goog.module.declareLegacyNamespace = function() {
  if (!COMPILED && !goog.isInModuleLoader_()) {
    throw new Error('goog.module.declareLegacyNamespace must be called from ' +
        'within a goog.module');
  }
  if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
    throw Error('goog.module must be called prior to ' +
        'goog.module.declareLegacyNamespace.');
  }
  goog.moduleLoaderState_.declareLegacyNamespace = true;
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                (opt_message ? ': ' + opt_message : '.'));
  }
};


/**
 * Forward declares a symbol. This is an indication to the compiler that the
 * symbol may be used in the source yet is not required and may not be provided
 * in compilation.
 *
 * The most common usage of forward declaration is code that takes a type as a
 * function parameter but does not need to require it. By forward declaring
 * instead of requiring, no hard dependency is made, and (if not required
 * elsewhere) the namespace may never be required and thus, not be pulled
 * into the JavaScript binary. If it is required elsewhere, it will be type
 * checked as normal.
 *
 * MOE:begin_intracomment_strip
 * See the detailed proposal at http://b/11534958
 * Design doc at http://go/forwarddeclare
 * Also see apps framework's forward_declarations builddef:
 * http://go/forwarddeclarations
 * MOE:end_intracomment_strip
 *
 * @param {string} name The namespace to forward declare in the form of
 *     "goog.package.part".
 */
goog.forwardDeclare = function(name) {};


/**
 * Forward declare type information. Used to assign types to goog.global
 * referenced object that would otherwise result in unknown type references
 * and thus block property disambiguation.
 */
goog.forwardDeclare('Document');
goog.forwardDeclare('HTMLScriptElement');
goog.forwardDeclare('XMLHttpRequest');


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return (name in goog.loadedModules_) ||
        (!goog.implicitNamespaces_[name] &&
            goog.isDefAndNotNull(goog.getObjectByName(name)));
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares that 'goog' and
   * 'goog.events' must be namespaces.
   *
   * @type {!Object<string, (boolean|undefined)>}
   * @private
   */
  goog.implicitNamespaces_ = {'goog.module': true};

  // NOTE: We add goog.module as an implicit namespace as goog.module is defined
  // here and because the existing module package has not been moved yet out of
  // the goog.module namespace. This satisifies both the debug loader and
  // ahead-of-time dependency management.
}


/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.  If you are using a compilation pass that
 * renames property names beware that using this function will not find renamed
 * properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {!Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {!Array<string>} provides An array of strings with
 *     the names of the objects this file provides.
 * @param {!Array<string>} requires An array of strings with
 *     the names of the objects this file requires.
 * @param {boolean=} opt_isModule Whether this dependency must be loaded as
 *     a module as declared by goog.module.
 */
goog.addDependency = function(relPath, provides, requires, opt_isModule) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      deps.pathIsModule[path] = !!opt_isModule;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};


// MOE:begin_strip
/**
 * Whether goog.require should throw an exception if it fails.
 * @type {boolean}
 */
goog.useStrictRequires = false;


// MOE:end_strip


// NOTE(nnaze): The debug DOM loader was included in base.js as an original way
// to do "debug-mode" development.  The dependency system can sometimes be
// confusing, as can the debug DOM loader's asynchronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the script
// will not load until some point after the current script.  If a namespace is
// needed at runtime, it needs to be defined in a previous script, or loaded via
// require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// https://developers.google.com/closure/library/docs/depswriter
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.define('goog.ENABLE_DEBUG_LOADER', true);


/**
 * @param {string} msg
 * @private
 */
goog.logToConsole_ = function(msg) {
  if (goog.global.console) {
    goog.global.console['error'](msg);
  }
};


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system. Note that all calls to goog.require will be
 * stripped by the JSCompiler when the --process_closure_primitives option is
 * used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide()) in
 *     the form "goog.package.part".
 * @return {?} If called within a goog.module file, the associated namespace or
 *     module otherwise null.
 */
goog.require = function(name) {
  // If the object already exists we do not need do do anything.
  if (!COMPILED) {
    if (goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_) {
      goog.maybeProcessDeferredDep_(name);
    }

    if (goog.isProvided_(name)) {
      if (goog.isInModuleLoader_()) {
        return goog.module.getInternal_(name);
      } else {
        return null;
      }
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.writeScripts_(path);
        return null;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    goog.logToConsole_(errorMessage);

    // MOE:begin_strip

    // NOTE(nicksantos): We could always throw an error, but this would break
    // legacy users that depended on this failing silently. Instead, the
    // compiler should warn us when there are invalid goog.require calls.
    // For now, we simply give clients a way to turn strict mode on.
    if (goog.useStrictRequires) {
      throw Error(errorMessage);
    }

    return null;

    // In external Closure, always error.
    // MOE:end_strip_and_replace throw Error(errorMessage);
  }
};


/**
 * Path for included scripts.
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default, the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 * @type {(function(string): boolean)|undefined}
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as an argument
 * because that would make it more difficult to obfuscate our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always returns the same
 * instance object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


/**
 * @define {boolean} Whether to load goog.modules using {@code eval} when using
 * the debug loader.  This provides a better debugging experience as the
 * source is unmodified and can be edited using Chrome Workspaces or similar.
 * However in some environments the use of {@code eval} is banned
 * so we provide an alternative.
 */
goog.define('goog.LOAD_MODULE_USING_EVAL', true);


/**
 * @define {boolean} Whether the exports of goog.modules should be sealed when
 * possible.
 */
goog.define('goog.SEAL_MODULE_EXPORTS', goog.DEBUG);


/**
 * The registry of initialized modules:
 * the module identifier to module exports map.
 * @private @const {!Object<string, ?>}
 */
goog.loadedModules_ = {};


/**
 * True if goog.dependencies_ is available.
 * @const {boolean}
 */
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;


if (goog.DEPENDENCIES_ENABLED) {

  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts.
   * @private
   * @type {{
   *   pathIsModule: !Object<string, boolean>,
   *   nameToPath: !Object<string, string>,
   *   requires: !Object<string, !Object<string, boolean>>,
   *   visited: !Object<string, boolean>,
   *   written: !Object<string, boolean>,
   *   deferred: !Object<string, string>
   * }}
   */
  goog.dependencies_ = {
    pathIsModule: {}, // 1 to 1

    nameToPath: {}, // 1 to 1

    requires: {}, // 1 to many

    // Used when resolving dependencies to prevent us from visiting file twice.
    visited: {},

    written: {}, // Used to keep track of script files we have written.

    deferred: {} // Used to track deferred module evaluations in old IEs
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    /** @type {Document} */
    var doc = goog.global.document;
    return doc != null && 'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of base.js script that bootstraps Closure.
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    /** @type {Document} */
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('SCRIPT');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var script = /** @type {!HTMLScriptElement} */ (scripts[i]);
      var src = script.src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @private
   */
  goog.importScript_ = function(src, opt_sourceText) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (importScript(src, opt_sourceText)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /** @const @private {boolean} */
  goog.IS_OLD_IE_ = !!(!goog.global.atob && goog.global.document &&
      goog.global.document.all);


  /**
   * Given a URL initiate retrieval and execution of the module.
   * @param {string} src Script source URL.
   * @private
   */
  goog.importModule_ = function(src) {
    // In an attempt to keep browsers from timing out loading scripts using
    // synchronous XHRs, put each load in its own script block.
    var bootstrap = 'goog.retrieveAndExecModule_("' + src + '");';

    if (goog.importScript_('', bootstrap)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /** @private {!Array<string>} */
  goog.queuedModules_ = [];


  /**
   * Return an appropriate module text. Suitable to insert into
   * a script tag (that is unescaped).
   * @param {string} srcUrl
   * @param {string} scriptText
   * @return {string}
   * @private
   */
  goog.wrapModule_ = function(srcUrl, scriptText) {
    if (!goog.LOAD_MODULE_USING_EVAL || !goog.isDef(goog.global.JSON)) {
      return '' +
          'goog.loadModule(function(exports) {' +
          '"use strict";' +
          scriptText +
          '\n' + // terminate any trailing single line comment.
          ';return exports' +
          '});' +
          '\n//# sourceURL=' + srcUrl + '\n';
    } else {
      return '' +
          'goog.loadModule(' +
          goog.global.JSON.stringify(
              scriptText + '\n//# sourceURL=' + srcUrl + '\n') +
          ');';
    }
  };

  // On IE9 and earlier, it is necessary to handle
  // deferred module loads. In later browsers, the
  // code to be evaluated is simply inserted as a script
  // block in the correct order. To eval deferred
  // code at the right time, we piggy back on goog.require to call
  // goog.maybeProcessDeferredDep_.
  //
  // The goog.requires are used both to bootstrap
  // the loading process (when no deps are available) and
  // declare that they should be available.
  //
  // Here we eval the sources, if all the deps are available
  // either already eval'd or goog.require'd.  This will
  // be the case when all the dependencies have already
  // been loaded, and the dependent module is loaded.
  //
  // But this alone isn't sufficient because it is also
  // necessary to handle the case where there is no root
  // that is not deferred.  For that there we register for an event
  // and trigger goog.loadQueuedModules_ handle any remaining deferred
  // evaluations.

  /**
   * Handle any remaining deferred goog.module evals.
   * @private
   */
  goog.loadQueuedModules_ = function() {
    var count = goog.queuedModules_.length;
    if (count > 0) {
      var queue = goog.queuedModules_;
      goog.queuedModules_ = [];
      for (var i = 0; i < count; i++) {
        var path = queue[i];
        goog.maybeProcessDeferredPath_(path);
      }
    }
  };


  /**
   * Eval the named module if its dependencies are
   * available.
   * @param {string} name The module to load.
   * @private
   */
  goog.maybeProcessDeferredDep_ = function(name) {
    if (goog.isDeferredModule_(name) &&
        goog.allDepsAreAvailable_(name)) {
      var path = goog.getPathFromDeps_(name);
      goog.maybeProcessDeferredPath_(goog.basePath + path);
    }
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose evaluation has been deferred.
   * @private
   */
  goog.isDeferredModule_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && goog.dependencies_.pathIsModule[path]) {
      var abspath = goog.basePath + path;
      return (abspath) in goog.dependencies_.deferred;
    }
    return false;
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose declared dependencies have all been loaded
   *     (eval'd or a deferred module load)
   * @private
   */
  goog.allDepsAreAvailable_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && (path in goog.dependencies_.requires)) {
      for (var requireName in goog.dependencies_.requires[path]) {
        if (!goog.isProvided_(requireName) &&
            !goog.isDeferredModule_(requireName)) {
          return false;
        }
      }
    }
    return true;
  };


  /**
   * @param {string} abspath
   * @private
   */
  goog.maybeProcessDeferredPath_ = function(abspath) {
    if (abspath in goog.dependencies_.deferred) {
      var src = goog.dependencies_.deferred[abspath];
      delete goog.dependencies_.deferred[abspath];
      goog.globalEval(src);
    }
  };


  /**
   * Load a goog.module from the provided URL.  This is not a general purpose
   * code loader and does not support late loading code, that is it should only
   * be used during page load. This method exists to support unit tests and
   * "debug" loaders that would otherwise have inserted script tags. Under the
   * hood this needs to use a synchronous XHR and is not recommeneded for
   * production code.
   *
   * The module's goog.requires must have already been satisified; an exception
   * will be thrown if this is not the case. This assumption is that no
   * "deps.js" file exists, so there is no way to discover and locate the
   * module-to-be-loaded's dependencies and no attempt is made to do so.
   *
   * There should only be one attempt to load a module.  If
   * "goog.loadModuleFromUrl" is called for an already loaded module, an
   * exception will be throw.
   *
   * @param {string} url The URL from which to attempt to load the goog.module.
   */
  goog.loadModuleFromUrl = function(url) {
    // Because this executes synchronously, we don't need to do any additional
    // bookkeeping. When "goog.loadModule" the namespace will be marked as
    // having been provided which is sufficient.
    goog.retrieveAndExecModule_(url);
  };


  /**
   * @param {function(?):?|string} moduleDef The module definition.
   */
  goog.loadModule = function(moduleDef) {
    // NOTE: we allow function definitions to be either in the from
    // of a string to eval (which keeps the original source intact) or
    // in a eval forbidden environment (CSP) we allow a function definition
    // which in its body must call {@code goog.module}, and return the exports
    // of the module.
    var previousState = goog.moduleLoaderState_;
    try {
      goog.moduleLoaderState_ = {
        moduleName: undefined,
        declareLegacyNamespace: false
      };
      var exports;
      if (goog.isFunction(moduleDef)) {
        exports = moduleDef.call(goog.global, {});
      } else if (goog.isString(moduleDef)) {
        exports = goog.loadModuleFromSource_.call(goog.global, moduleDef);
      } else {
        throw Error('Invalid module definition');
      }

      var moduleName = goog.moduleLoaderState_.moduleName;
      if (!goog.isString(moduleName) || !moduleName) {
        throw Error('Invalid module name \"' + moduleName + '\"');
      }

      // Don't seal legacy namespaces as they may be uses as a parent of
      // another namespace
      if (goog.moduleLoaderState_.declareLegacyNamespace) {
        goog.constructNamespace_(moduleName, exports);
      } else if (goog.SEAL_MODULE_EXPORTS && Object.seal) {
        Object.seal(exports);
      }

      goog.loadedModules_[moduleName] = exports;
    } finally {
      goog.moduleLoaderState_ = previousState;
    }
  };


  /**
   * @private @const {function(string):?}
   *
   * The new type inference warns because this function has no formal
   * parameters, but its jsdoc says that it takes one argument.
   * (The argument is used via arguments[0], but NTI does not detect this.)
   * @suppress {newCheckTypes}
   */
  goog.loadModuleFromSource_ = function() {
    // NOTE: we avoid declaring parameters or local variables here to avoid
    // masking globals or leaking values into the module definition.
    'use strict';
    var exports = {};
    eval(arguments[0]);
    return exports;
  };


  /**
   * Writes a new script pointing to {@code src} directly into the DOM.
   *
   * NOTE: This method is not CSP-compliant. @see goog.appendScriptSrcNode_ for
   * the fallback mechanism.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.writeScriptSrcNode_ = function(src) {
    goog.global.document.write(
        '<script type="text/javascript" src="' + src + '"></' + 'script>');
  };


  /**
   * Appends a new script node to the DOM using a CSP-compliant mechanism. This
   * method exists as a fallback for document.write (which is not allowed in a
   * strict CSP context, e.g., Chrome apps).
   *
   * NOTE: This method is not analogous to using document.write to insert a
   * <script> tag; specifically, the user agent will execute a script added by
   * document.write immediately after the current script block finishes
   * executing, whereas the DOM-appended script node will not be executed until
   * the entire document is parsed and executed. That is to say, this script is
   * added to the end of the script execution queue.
   *
   * The page must not attempt to call goog.required entities until after the
   * document has loaded, e.g., in or after the window.onload callback.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.appendScriptSrcNode_ = function(src) {
    /** @type {Document} */
    var doc = goog.global.document;
    var scriptEl = /** @type {HTMLScriptElement} */ (
        doc.createElement('script'));
    scriptEl.type = 'text/javascript';
    scriptEl.src = src;
    scriptEl.defer = false;
    scriptEl.async = false;
    doc.head.appendChild(scriptEl);
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script url.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src, opt_sourceText) {
    if (goog.inHtmlDocument_()) {
      /** @type {!HTMLDocument} */
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page. This does not apply to the CSP-compliant method
      // of writing script tags.
      if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING &&
          doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }

      var isOldIE = goog.IS_OLD_IE_;

      if (opt_sourceText === undefined) {
        if (!isOldIE) {
          if (goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING) {
            goog.appendScriptSrcNode_(src);
          } else {
            goog.writeScriptSrcNode_(src);
          }
        } else {
          var state = " onreadystatechange='goog.onScriptLoad_(this, " +
              ++goog.lastNonModuleScriptIndex_ + ")' ";
          doc.write(
              '<script type="text/javascript" src="' +
                  src + '"' + state + '></' + 'script>');
        }
      } else {
        doc.write(
            '<script type="text/javascript">' +
            opt_sourceText +
            '</' + 'script>');
      }
      return true;
    } else {
      return false;
    }
  };


  /** @private {number} */
  goog.lastNonModuleScriptIndex_ = 0;


  /**
   * A readystatechange handler for legacy IE
   * @param {!HTMLScriptElement} script
   * @param {number} scriptIndex
   * @return {boolean}
   * @private
   */
  goog.onScriptLoad_ = function(script, scriptIndex) {
    // for now load the modules when we reach the last script,
    // later allow more inter-mingling.
    if (script.readyState == 'complete' &&
        goog.lastNonModuleScriptIndex_ == scriptIndex) {
      goog.loadQueuedModules_();
    }
    return true;
  };

  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @param {string} pathToLoad The path from which to start discovering
   *     dependencies.
   * @private
   */
  goog.writeScripts_ = function(pathToLoad) {
    /** @type {!Array<string>} The scripts we need to write this time. */
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    /** @param {string} path */
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // We have already visited this one. We can get here if we have cyclic
      // dependencies.
      if (path in deps.visited) {
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    visitNode(pathToLoad);

    // record that we are going to load all these scripts.
    for (var i = 0; i < scripts.length; i++) {
      var path = scripts[i];
      goog.dependencies_.written[path] = true;
    }

    // If a module is loaded synchronously then we need to
    // clear the current inModuleLoader value, and restore it when we are
    // done loading the current "requires".
    var moduleState = goog.moduleLoaderState_;
    goog.moduleLoaderState_ = null;

    for (var i = 0; i < scripts.length; i++) {
      var path = scripts[i];
      if (path) {
        if (!deps.pathIsModule[path]) {
          goog.importScript_(goog.basePath + path);
        } else {
          goog.importModule_(goog.basePath + path);
        }
      } else {
        goog.moduleLoaderState_ = moduleState;
        throw Error('Undefined script input');
      }
    }

    // restore the current "module loading state"
    goog.moduleLoaderState_ = moduleState;
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}


/**
 * Normalize a file path by removing redundant ".." and extraneous "." file
 * path components.
 * @param {string} path
 * @return {string}
 * @private
 */
goog.normalizePath_ = function(path) {
  var components = path.split('/');
  var i = 0;
  while (i < components.length) {
    if (components[i] == '.') {
      components.splice(i, 1);
    } else if (i && components[i] == '..' &&
        components[i - 1] && components[i - 1] != '..') {
      components.splice(--i, 2);
    } else {
      i++;
    }
  }
  return components.join('/');
};


/**
 * Loads file by synchronous XHR. Should not be used in production environments.
 * @param {string} src Source URL.
 * @return {string} File contents.
 * @private
 */
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  } else {
    /** @type {XMLHttpRequest} */
    var xhr = new goog.global['XMLHttpRequest']();
    xhr.open('get', src, false);
    xhr.send();
    return xhr.responseText;
  }
};


/**
 * Retrieve and execute a module.
 * @param {string} src Script source URL.
 * @private
 */
goog.retrieveAndExecModule_ = function(src) {
  if (!COMPILED) {
    // The full but non-canonicalized URL for later use.
    var originalPath = src;
    // Canonicalize the path, removing any /./ or /../ since Chrome's debugging
    // console doesn't auto-canonicalize XHR loads as it does <script> srcs.
    src = goog.normalizePath_(src);

    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;

    var scriptText = goog.loadFileSync_(src);

    if (scriptText != null) {
      var execModuleScript = goog.wrapModule_(src, scriptText);
      var isOldIE = goog.IS_OLD_IE_;
      if (isOldIE) {
        goog.dependencies_.deferred[originalPath] = execModuleScript;
        goog.queuedModules_.push(originalPath);
      } else {
        importScript(src, execModuleScript);
      }
    } else {
      throw new Error('load of ' + src + 'failed');
    }
  }
};


//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {?} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {!Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case.
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox typeof
    // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
    // would like to return object for those and we can detect an invalid
    // function by making sure that the function object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property. As a special case, a function value is not array like, because its
 * length property is fixed to correspond to the number of expected arguments.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  // We do not use goog.isObject here in order to exclude function values.
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like the
 * value needs to be an object and have a getFullYear() function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays and
 * functions.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. The unique ID is
 * guaranteed to be unique across the current session amongst objects that are
 * passed into {@code getUid}. There is no guarantee that the ID is unique or
 * consistent across sessions. It is unsafe to generate unique ID for function
 * prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Whether the given object is already assigned a unique ID.
 *
 * This does not modify the object.
 *
 * @param {!Object} obj The object to check.
 * @return {boolean} Whether there is an assigned unique id for the object.
 */
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In IE, DOM nodes are not instances of Object and throw an exception if we
  // try to delete.  Instead we try to use removeAttribute.
  if (obj !== null && 'removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure JavaScript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind is
 *     deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of this 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-specified
 * ones.
 *
 * Also see: {@link #partial}.
 *
 * Usage:
 * <pre>var barMethBound = goog.bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function goog.bind() was
 *     invoked as a method of.
 * @template T
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
      // extension environment. This means that for Chrome extensions, they get
      // the implementation of Function.prototype.bind that calls goog.bind
      // instead of the native one. Even worse, we don't want to introduce a
      // circular dependency between goog.bind and Function.prototype.bind, so
      // we have to hack this to make sure it works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like goog.bind(), except that a 'this object' is not required. Useful when
 * the target function is already bound.
 *
 * Usage:
 * var g = goog.partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Clone the array (with slice()) and append additional arguments
    // to the existing arguments.
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _evalTest_ = 1;');
      if (typeof goog.global['_evalTest_'] != 'undefined') {
        try {
          delete goog.global['_evalTest_'];
        } catch (ignore) {
          // Microsoft edge fails the deletion above in strict mode.
        }
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      /** @type {Document} */
      var doc = goog.global.document;
      var scriptElt = /** @type {!HTMLScriptElement} */ (
          doc.createElement('SCRIPT'));
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(pupius): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @private {!Object<string, string>|undefined}
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a hyphen and
 * passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which these
 * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
 * of the passed in css name is rewritten according to the map. In the BY_WHOLE
 * style, the full css name is looked up in the map directly. If a rewrite is
 * not specified by the map, the compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls to
 * goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x = 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed only the
 * modifier will be processed, as it is assumed the first argument was generated
 * as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --process_closure_primitives flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {!Object<string, string>|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object<string, string>=} opt_values Maps place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
      return (opt_values != null && key in opt_values) ?
          opt_values[key] : match;
    });
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primitive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated, unless they are
 * exported in turn via this function or goog.exportProperty.
 *
 * Also handy for making public items that are defined in anonymous closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is goog.global.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * This function is only available if you use goog.inherits to
   * express inheritance relationships between classes.
   *
   * NOTE: This is a replacement for goog.base and for superClass_
   * property defined in childCtor.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling
   *     superclass constructor can be done with the special string
   *     'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * constructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass the name of the
 * method as the second argument to this function. If you do not, you will get a
 * runtime error. This calls the superclass' method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express inheritance
 * relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the compiler will do
 * macro expansion to remove a lot of the extra overhead that this function
 * introduces. The compiler will also enforce a lot of the assumptions that this
 * function makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 * @suppress {es5Strict} This method can not be used in strict mode, but
 *     all Closure Library consumers must depend on this file.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;

  if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
    throw Error('arguments.caller not defined.  goog.base() cannot be used ' +
                'with strict mode code. See ' +
                'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
  }

  if (caller.superClass_) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var ctorArgs = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }

  // Copying using loop to avoid deop due to passing arguments object to
  // function. This is faster in many JS engines as of late 2014.
  var args = new Array(arguments.length - 2);
  for (var i = 2; i < arguments.length; i++) {
    args[i - 2] = arguments[i];
  }
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain, then one of two
  // things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 *
 * MOE:begin_intracomment_strip
 * See the goog.scope document at http://go/goog.scope
 * MOE:end_intracomment_strip
 *
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


/*
 * To support uncompiled, strict mode bundles that use eval to divide source
 * like so:
 *    eval('someSource;//# sourceUrl sourcefile.js');
 * We need to export the globally defined symbols "goog" and "COMPILED".
 * Exporting "goog" breaks the compiler optimizations, so we required that
 * be defined externally.
 * NOTE: We don't use goog.exportSymbol here because we don't want to trigger
 * extern generation when that compiler option is enabled.
 */
if (!COMPILED) {
  goog.global['COMPILED'] = COMPILED;
}


//==============================================================================
// goog.defineClass implementation
//==============================================================================


/**
 * Creates a restricted form of a Closure "class":
 *   - from the compiler's perspective, the instance returned from the
 *     constructor is sealed (no new properties may be added).  This enables
 *     better checks.
 *   - the compiler will rewrite this definition to a form that is optimal
 *     for type checking and optimization (initially this will be a more
 *     traditional form).
 *
 * @param {Function} superClass The superclass, Object or null.
 * @param {goog.defineClass.ClassDescriptor} def
 *     An object literal describing
 *     the class.  It may have the following properties:
 *     "constructor": the constructor function
 *     "statics": an object literal containing methods to add to the constructor
 *        as "static" methods or a function that will receive the constructor
 *        function as its only parameter to which static properties can
 *        be added.
 *     all other properties are added to the prototype.
 * @return {!Function} The class constructor.
 */
goog.defineClass = function(superClass, def) {
  // TODO(johnlenz): consider making the superClass an optional parameter.
  var constructor = def.constructor;
  var statics = def.statics;
  // Wrap the constructor prior to setting up the prototype and static methods.
  if (!constructor || constructor == Object.prototype.constructor) {
    constructor = function() {
      throw Error('cannot instantiate an interface (no constructor defined).');
    };
  }

  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  if (superClass) {
    goog.inherits(cls, superClass);
  }

  // Remove all the properties that should not be copied to the prototype.
  delete def.constructor;
  delete def.statics;

  goog.defineClass.applyProperties_(cls.prototype, def);
  if (statics != null) {
    if (statics instanceof Function) {
      statics(cls);
    } else {
      goog.defineClass.applyProperties_(cls, statics);
    }
  }

  return cls;
};


/**
 * @typedef {{
 *   constructor: (!Function|undefined),
 *   statics: (Object|undefined|function(Function):void)
 * }}
 * @suppress {missingProvide}
 */
goog.defineClass.ClassDescriptor;


/**
 * @define {boolean} Whether the instances returned by
 * goog.defineClass should be sealed when possible.
 */
goog.define('goog.defineClass.SEAL_CLASS_INSTANCES', goog.DEBUG);


/**
 * If goog.defineClass.SEAL_CLASS_INSTANCES is enabled and Object.seal is
 * defined, this function will wrap the constructor in a function that seals the
 * results of the provided constructor function.
 *
 * @param {!Function} ctr The constructor whose results maybe be sealed.
 * @param {Function} superClass The superclass constructor.
 * @return {!Function} The replacement constructor.
 * @private
 */
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (goog.defineClass.SEAL_CLASS_INSTANCES &&
      Object.seal instanceof Function) {
    // Don't seal subclasses of unsealable-tagged legacy classes.
    if (superClass && superClass.prototype &&
        superClass.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
      return ctr;
    }
    /**
     * @this {Object}
     * @return {?}
     */
    var wrappedCtr = function() {
      // Don't seal an instance of a subclass when it calls the constructor of
      // its super class as there is most likely still setup to do.
      var instance = ctr.apply(this, arguments) || this;
      instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];
      if (this.constructor === wrappedCtr) {
        Object.seal(instance);
      }
      return instance;
    };
    return wrappedCtr;
  }
  return ctr;
};


// TODO(johnlenz): share these values with the goog.object
/**
 * The names of the fields that are defined on Object.prototype.
 * @type {!Array<string>}
 * @private
 * @const
 */
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


// TODO(johnlenz): share this function with the goog.object
/**
 * @param {!Object} target The object to add properties to.
 * @param {!Object} source The object to copy properties from.
 * @private
 */
goog.defineClass.applyProperties_ = function(target, source) {
  // TODO(johnlenz): update this to support ES5 getters/setters

  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }

  // For IE the for-in-loop does not contain any properties that are not
  // enumerable on the prototype object (for example isPrototypeOf from
  // Object.prototype) and it will also not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
  for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
};


/**
 * Sealing classes breaks the older idiom of assigning properties on the
 * prototype rather than in the constructor.  As such, goog.defineClass
 * must not seal subclasses of these old-style classes until they are fixed.
 * Until then, this marks a class as "broken", instructing defineClass
 * not to seal subclasses.
 * @param {!Function} ctr The legacy constructor to tag as unsealable.
 */
goog.tagUnsealableClass = function(ctr) {
  if (!COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES) {
    ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
  }
};


/**
 * Name for unsealable tag property.
 * @const @private {string}
 */
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = 'goog_defineClass_legacy_unsealable';

//javascript/closure/deps.js
// Copyright 2015 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// This file has been auto-generated by GenJsDeps, please do not edit.

// Disable Clang formatter for this file.
// See http://clang.llvm.org/docs/ClangFormatStyleOptions.html#disabling-formatting-on-a-piece-of-code
// clang-format off

goog.addDependency('../../third_party/javascript/closure/caja/string/html/htmlparser.js', ['goog.string.html', 'goog.string.html.HtmlParser', 'goog.string.html.HtmlParser.EFlags', 'goog.string.html.HtmlParser.Elements', 'goog.string.html.HtmlParser.Entities', 'goog.string.html.HtmlSaxHandler'], [], false);
goog.addDependency('../../third_party/javascript/closure/caja/string/html/htmlsanitizer.js', ['goog.string.html.HtmlSanitizer', 'goog.string.html.HtmlSanitizer.AttributeType', 'goog.string.html.HtmlSanitizer.Attributes', 'goog.string.html.htmlSanitize'], ['goog.string.StringBuffer', 'goog.string.html.HtmlParser', 'goog.string.html.HtmlSaxHandler'], false);
goog.addDependency('../../third_party/javascript/closure/dojo/dom/query.js', ['goog.dom.query'], ['goog.array', 'goog.dom', 'goog.functions', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('../../third_party/javascript/closure/jpeg_encoder/jpeg_encoder_basic.js', ['goog.crypt.JpegEncoder'], ['goog.crypt.base64'], false);
goog.addDependency('../../third_party/javascript/closure/loremipsum/text/loremipsum.js', ['goog.text.LoremIpsum'], ['goog.array', 'goog.math', 'goog.string', 'goog.structs.Map', 'goog.structs.Set'], false);
goog.addDependency('../../third_party/javascript/closure/mochikit/async/deferred.js', ['goog.async.Deferred', 'goog.async.Deferred.AlreadyCalledError', 'goog.async.Deferred.CanceledError'], ['goog.Promise', 'goog.Thenable', 'goog.array', 'goog.asserts', 'goog.debug.Error'], false);
goog.addDependency('../../third_party/javascript/closure/mochikit/async/deferredlist.js', ['goog.async.DeferredList'], ['goog.async.Deferred'], false);
goog.addDependency('../../third_party/javascript/closure/osapi/osapi.js', ['goog.osapi'], [], false);
goog.addDependency('../../third_party/javascript/closure/svgpan/svgpan.js', ['svgpan.SvgPan'], ['goog.Disposable', 'goog.events', 'goog.events.EventType', 'goog.events.MouseWheelHandler'], false);
goog.addDependency('a11y/aria/announcer.js', ['goog.a11y.aria.Announcer'], ['goog.Disposable', 'goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.object'], false);
goog.addDependency('a11y/aria/announcer_test.js', ['goog.a11y.aria.AnnouncerTest'], ['goog.a11y.aria', 'goog.a11y.aria.Announcer', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.State', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.iframe', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('a11y/aria/aria.js', ['goog.a11y.aria'], ['goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.a11y.aria.datatables', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.object', 'goog.string'], false);
goog.addDependency('a11y/aria/aria_test.js', ['goog.a11y.ariaTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit'], false);
goog.addDependency('a11y/aria/attributes.js', ['goog.a11y.aria.AutoCompleteValues', 'goog.a11y.aria.CheckedValues', 'goog.a11y.aria.DropEffectValues', 'goog.a11y.aria.ExpandedValues', 'goog.a11y.aria.GrabbedValues', 'goog.a11y.aria.InvalidValues', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.OrientationValues', 'goog.a11y.aria.PressedValues', 'goog.a11y.aria.RelevantValues', 'goog.a11y.aria.SelectedValues', 'goog.a11y.aria.SortValues', 'goog.a11y.aria.State'], [], false);
goog.addDependency('a11y/aria/datatables.js', ['goog.a11y.aria.datatables'], ['goog.a11y.aria.State', 'goog.object'], false);
goog.addDependency('a11y/aria/roles.js', ['goog.a11y.aria.Role'], [], false);
goog.addDependency('array/array.js', ['goog.array', 'goog.array.ArrayLike'], ['goog.asserts'], false);
goog.addDependency('array/array_test.js', ['goog.arrayTest'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('asserts/asserts.js', ['goog.asserts', 'goog.asserts.AssertionError'], ['goog.debug.Error', 'goog.dom.NodeType', 'goog.string'], false);
goog.addDependency('asserts/asserts_test.js', ['goog.assertsTest'], ['goog.asserts', 'goog.asserts.AssertionError', 'goog.dom', 'goog.dom.TagName', 'goog.string', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('async/animationdelay.js', ['goog.async.AnimationDelay'], ['goog.Disposable', 'goog.events', 'goog.functions'], false);
goog.addDependency('async/animationdelay_test.js', ['goog.async.AnimationDelayTest'], ['goog.Timer', 'goog.async.AnimationDelay', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.testing.testSuite'], true);
goog.addDependency('async/conditionaldelay.js', ['goog.async.ConditionalDelay'], ['goog.Disposable', 'goog.async.Delay'], false);
goog.addDependency('async/conditionaldelay_test.js', ['goog.async.ConditionalDelayTest'], ['goog.async.ConditionalDelay', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('async/debouncer.js', ['goog.async.Debouncer'], ['goog.Disposable', 'goog.Timer'], false);
goog.addDependency('async/debouncer_test.js', ['goog.async.DebouncerTest'], ['goog.array', 'goog.async.Debouncer', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('async/delay.js', ['goog.Delay', 'goog.async.Delay'], ['goog.Disposable', 'goog.Timer'], false);
goog.addDependency('async/delay_test.js', ['goog.async.DelayTest'], ['goog.async.Delay', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('async/freelist.js', ['goog.async.FreeList'], [], false);
goog.addDependency('async/freelist_test.js', ['goog.async.FreeListTest'], ['goog.async.FreeList', 'goog.testing.jsunit'], false);
goog.addDependency('async/nexttick.js', ['goog.async.nextTick', 'goog.async.throwException'], ['goog.debug.entryPointRegistry', 'goog.dom.TagName', 'goog.functions', 'goog.labs.userAgent.browser', 'goog.labs.userAgent.engine'], false);
goog.addDependency('async/nexttick_test.js', ['goog.async.nextTickTest'], ['goog.Promise', 'goog.Timer', 'goog.async.nextTick', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.dom', 'goog.dom.TagName', 'goog.labs.userAgent.browser', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('async/run.js', ['goog.async.run'], ['goog.async.WorkQueue', 'goog.async.nextTick', 'goog.async.throwException'], false);
goog.addDependency('async/run_test.js', ['goog.async.runTest'], ['goog.async.run', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('async/throttle.js', ['goog.Throttle', 'goog.async.Throttle'], ['goog.Disposable', 'goog.Timer'], false);
goog.addDependency('async/throttle_test.js', ['goog.async.ThrottleTest'], ['goog.async.Throttle', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('async/workqueue.js', ['goog.async.WorkItem', 'goog.async.WorkQueue'], ['goog.asserts', 'goog.async.FreeList'], false);
goog.addDependency('async/workqueue_test.js', ['goog.async.WorkQueueTest'], ['goog.async.WorkQueue', 'goog.testing.jsunit'], false);
goog.addDependency('base.js', ['goog'], [], false);
goog.addDependency('base_module_test.js', ['goog.baseModuleTest'], ['goog.Timer', 'goog.test_module', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.testSuite'], true);
goog.addDependency('base_test.js', ['an.existing.path', 'dup.base', 'far.out', 'goog.baseTest', 'goog.explicit', 'goog.implicit.explicit', 'goog.test', 'goog.test.name', 'goog.test.name.space', 'goog.xy', 'goog.xy.z', 'ns', 'testDep.bar'], ['goog.Promise', 'goog.Timer', 'goog.dom.TagName', 'goog.functions', 'goog.test_module', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('color/alpha.js', ['goog.color.alpha'], ['goog.color'], false);
goog.addDependency('color/alpha_test.js', ['goog.color.alphaTest'], ['goog.array', 'goog.color', 'goog.color.alpha', 'goog.testing.jsunit'], false);
goog.addDependency('color/color.js', ['goog.color', 'goog.color.Hsl', 'goog.color.Hsv', 'goog.color.Rgb'], ['goog.color.names', 'goog.math'], false);
goog.addDependency('color/color_test.js', ['goog.colorTest'], ['goog.array', 'goog.color', 'goog.color.names', 'goog.testing.jsunit'], false);
goog.addDependency('color/names.js', ['goog.color.names'], [], false);
goog.addDependency('crypt/aes.js', ['goog.crypt.Aes'], ['goog.asserts', 'goog.crypt.BlockCipher'], false);
goog.addDependency('crypt/aes_test.js', ['goog.crypt.AesTest'], ['goog.crypt', 'goog.crypt.Aes', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/arc4.js', ['goog.crypt.Arc4'], ['goog.asserts'], false);
goog.addDependency('crypt/arc4_test.js', ['goog.crypt.Arc4Test'], ['goog.array', 'goog.crypt.Arc4', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/base64.js', ['goog.crypt.base64'], ['goog.asserts', 'goog.crypt', 'goog.userAgent'], false);
goog.addDependency('crypt/base64_test.js', ['goog.crypt.base64Test'], ['goog.crypt', 'goog.crypt.base64', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/basen.js', ['goog.crypt.baseN'], [], false);
goog.addDependency('crypt/basen_test.js', ['goog.crypt.baseNTest'], ['goog.crypt.baseN', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/blobhasher.js', ['goog.crypt.BlobHasher', 'goog.crypt.BlobHasher.EventType'], ['goog.asserts', 'goog.events.EventTarget', 'goog.fs', 'goog.log'], false);
goog.addDependency('crypt/blobhasher_test.js', ['goog.crypt.BlobHasherTest'], ['goog.crypt', 'goog.crypt.BlobHasher', 'goog.crypt.Md5', 'goog.events', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/blockcipher.js', ['goog.crypt.BlockCipher'], [], false);
goog.addDependency('crypt/bytestring_perf.js', ['goog.crypt.byteArrayToStringPerf'], ['goog.array', 'goog.dom', 'goog.testing.PerformanceTable'], false);
goog.addDependency('crypt/cbc.js', ['goog.crypt.Cbc'], ['goog.array', 'goog.asserts', 'goog.crypt'], false);
goog.addDependency('crypt/cbc_test.js', ['goog.crypt.CbcTest'], ['goog.crypt', 'goog.crypt.Aes', 'goog.crypt.Cbc', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/crypt.js', ['goog.crypt'], ['goog.array', 'goog.asserts'], false);
goog.addDependency('crypt/crypt_test.js', ['goog.cryptTest'], ['goog.crypt', 'goog.string', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/hash.js', ['goog.crypt.Hash'], [], false);
goog.addDependency('crypt/hash32.js', ['goog.crypt.hash32'], ['goog.crypt'], false);
goog.addDependency('crypt/hash32_test.js', ['goog.crypt.hash32Test'], ['goog.crypt.hash32', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/hashtester.js', ['goog.crypt.hashTester'], ['goog.array', 'goog.crypt', 'goog.dom', 'goog.dom.TagName', 'goog.testing.PerformanceTable', 'goog.testing.PseudoRandom', 'goog.testing.asserts'], false);
goog.addDependency('crypt/hmac.js', ['goog.crypt.Hmac'], ['goog.crypt.Hash'], false);
goog.addDependency('crypt/hmac_test.js', ['goog.crypt.HmacTest'], ['goog.crypt.Hmac', 'goog.crypt.Sha1', 'goog.crypt.hashTester', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/md5.js', ['goog.crypt.Md5'], ['goog.crypt.Hash'], false);
goog.addDependency('crypt/md5_test.js', ['goog.crypt.Md5Test'], ['goog.crypt', 'goog.crypt.Md5', 'goog.crypt.hashTester', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/pbkdf2.js', ['goog.crypt.pbkdf2'], ['goog.array', 'goog.asserts', 'goog.crypt', 'goog.crypt.Hmac', 'goog.crypt.Sha1'], false);
goog.addDependency('crypt/pbkdf2_test.js', ['goog.crypt.pbkdf2Test'], ['goog.crypt', 'goog.crypt.pbkdf2', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('crypt/sha1.js', ['goog.crypt.Sha1'], ['goog.crypt.Hash'], false);
goog.addDependency('crypt/sha1_test.js', ['goog.crypt.Sha1Test'], ['goog.crypt', 'goog.crypt.Sha1', 'goog.crypt.hashTester', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('crypt/sha2.js', ['goog.crypt.Sha2'], ['goog.array', 'goog.asserts', 'goog.crypt.Hash'], false);
goog.addDependency('crypt/sha224.js', ['goog.crypt.Sha224'], ['goog.crypt.Sha2'], false);
goog.addDependency('crypt/sha224_test.js', ['goog.crypt.Sha224Test'], ['goog.crypt', 'goog.crypt.Sha224', 'goog.crypt.hashTester', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/sha256.js', ['goog.crypt.Sha256'], ['goog.crypt.Sha2'], false);
goog.addDependency('crypt/sha256_test.js', ['goog.crypt.Sha256Test'], ['goog.crypt', 'goog.crypt.Sha256', 'goog.crypt.hashTester', 'goog.testing.jsunit'], false);
goog.addDependency('crypt/sha2_64bit.js', ['goog.crypt.Sha2_64bit'], ['goog.array', 'goog.asserts', 'goog.crypt.Hash', 'goog.math.Long'], false);
goog.addDependency('crypt/sha2_64bit_test.js', ['goog.crypt.Sha2_64bit_test'], ['goog.array', 'goog.crypt', 'goog.crypt.Sha384', 'goog.crypt.Sha512', 'goog.crypt.Sha512_256', 'goog.crypt.hashTester', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('crypt/sha384.js', ['goog.crypt.Sha384'], ['goog.crypt.Sha2_64bit'], false);
goog.addDependency('crypt/sha512.js', ['goog.crypt.Sha512'], ['goog.crypt.Sha2_64bit'], false);
goog.addDependency('crypt/sha512_256.js', ['goog.crypt.Sha512_256'], ['goog.crypt.Sha2_64bit'], false);
goog.addDependency('cssom/cssom.js', ['goog.cssom', 'goog.cssom.CssRuleType'], ['goog.array', 'goog.dom', 'goog.dom.TagName'], false);
goog.addDependency('cssom/cssom_test.js', ['goog.cssomTest'], ['goog.array', 'goog.cssom', 'goog.cssom.CssRuleType', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('cssom/iframe/style.js', ['goog.cssom.iframe.style'], ['goog.asserts', 'goog.cssom', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.string', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('cssom/iframe/style_test.js', ['goog.cssom.iframe.styleTest'], ['goog.cssom', 'goog.cssom.iframe.style', 'goog.dom', 'goog.dom.DomHelper', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('datasource/datamanager.js', ['goog.ds.DataManager'], ['goog.ds.BasicNodeList', 'goog.ds.DataNode', 'goog.ds.Expr', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.Map'], false);
goog.addDependency('datasource/datasource.js', ['goog.ds.BaseDataNode', 'goog.ds.BasicNodeList', 'goog.ds.DataNode', 'goog.ds.DataNodeList', 'goog.ds.EmptyNodeList', 'goog.ds.LoadState', 'goog.ds.SortedNodeList', 'goog.ds.Util', 'goog.ds.logger'], ['goog.array', 'goog.log'], false);
goog.addDependency('datasource/datasource_test.js', ['goog.ds.JsDataSourceTest'], ['goog.dom.xml', 'goog.ds.DataManager', 'goog.ds.JsDataSource', 'goog.ds.SortedNodeList', 'goog.ds.XmlDataSource', 'goog.testing.jsunit'], false);
goog.addDependency('datasource/expr.js', ['goog.ds.Expr'], ['goog.ds.BasicNodeList', 'goog.ds.EmptyNodeList', 'goog.string'], false);
goog.addDependency('datasource/expr_test.js', ['goog.ds.ExprTest'], ['goog.ds.DataManager', 'goog.ds.Expr', 'goog.ds.JsDataSource', 'goog.testing.jsunit'], false);
goog.addDependency('datasource/fastdatanode.js', ['goog.ds.AbstractFastDataNode', 'goog.ds.FastDataNode', 'goog.ds.FastListNode', 'goog.ds.PrimitiveFastDataNode'], ['goog.ds.DataManager', 'goog.ds.DataNodeList', 'goog.ds.EmptyNodeList', 'goog.string'], false);
goog.addDependency('datasource/fastdatanode_test.js', ['goog.ds.FastDataNodeTest'], ['goog.array', 'goog.ds.DataManager', 'goog.ds.Expr', 'goog.ds.FastDataNode', 'goog.testing.jsunit'], false);
goog.addDependency('datasource/jsdatasource.js', ['goog.ds.JsDataSource', 'goog.ds.JsPropertyDataSource'], ['goog.ds.BaseDataNode', 'goog.ds.BasicNodeList', 'goog.ds.DataManager', 'goog.ds.DataNode', 'goog.ds.EmptyNodeList', 'goog.ds.LoadState'], false);
goog.addDependency('datasource/jsondatasource.js', ['goog.ds.JsonDataSource'], ['goog.Uri', 'goog.dom', 'goog.dom.TagName', 'goog.ds.DataManager', 'goog.ds.JsDataSource', 'goog.ds.LoadState', 'goog.ds.logger', 'goog.log'], false);
goog.addDependency('datasource/jsxmlhttpdatasource.js', ['goog.ds.JsXmlHttpDataSource'], ['goog.Uri', 'goog.ds.DataManager', 'goog.ds.FastDataNode', 'goog.ds.LoadState', 'goog.ds.logger', 'goog.events', 'goog.log', 'goog.net.EventType', 'goog.net.XhrIo'], false);
goog.addDependency('datasource/jsxmlhttpdatasource_test.js', ['goog.ds.JsXmlHttpDataSourceTest'], ['goog.ds.JsXmlHttpDataSource', 'goog.testing.TestQueue', 'goog.testing.jsunit', 'goog.testing.net.XhrIo'], false);
goog.addDependency('datasource/xmldatasource.js', ['goog.ds.XmlDataSource', 'goog.ds.XmlHttpDataSource'], ['goog.Uri', 'goog.dom.NodeType', 'goog.dom.xml', 'goog.ds.BasicNodeList', 'goog.ds.DataManager', 'goog.ds.DataNode', 'goog.ds.LoadState', 'goog.ds.logger', 'goog.net.XhrIo', 'goog.string'], false);
goog.addDependency('date/date.js', ['goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval', 'goog.date.month', 'goog.date.weekDay'], ['goog.asserts', 'goog.date.DateLike', 'goog.i18n.DateTimeSymbols', 'goog.string'], false);
goog.addDependency('date/date_test.js', ['goog.dateTest'], ['goog.array', 'goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval', 'goog.date.month', 'goog.date.weekDay', 'goog.i18n.DateTimeSymbols', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.platform', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('date/datelike.js', ['goog.date.DateLike'], [], false);
goog.addDependency('date/daterange.js', ['goog.date.DateRange', 'goog.date.DateRange.Iterator', 'goog.date.DateRange.StandardDateRangeKeys'], ['goog.date.Date', 'goog.date.Interval', 'goog.iter.Iterator', 'goog.iter.StopIteration'], false);
goog.addDependency('date/daterange_test.js', ['goog.date.DateRangeTest'], ['goog.date.Date', 'goog.date.DateRange', 'goog.date.Interval', 'goog.i18n.DateTimeSymbols', 'goog.testing.jsunit'], false);
goog.addDependency('date/duration.js', ['goog.date.duration'], ['goog.i18n.DateTimeFormat', 'goog.i18n.MessageFormat'], false);
goog.addDependency('date/duration_test.js', ['goog.date.durationTest'], ['goog.date.duration', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_bn', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_fa', 'goog.testing.jsunit'], false);
goog.addDependency('date/relative.js', ['goog.date.relative', 'goog.date.relative.TimeDeltaFormatter', 'goog.date.relative.Unit'], ['goog.i18n.DateTimeFormat', 'goog.i18n.DateTimePatterns'], false);
goog.addDependency('date/relative_test.js', ['goog.date.relativeTest'], ['goog.date.DateTime', 'goog.date.relative', 'goog.i18n.DateTimeFormat', 'goog.testing.jsunit'], false);
goog.addDependency('date/relativewithplurals.js', ['goog.date.relativeWithPlurals'], ['goog.date.relative', 'goog.date.relative.Unit', 'goog.i18n.MessageFormat'], false);
goog.addDependency('date/relativewithplurals_test.js', ['goog.date.relativeWithPluralsTest'], ['goog.date.relative', 'goog.date.relativeTest', 'goog.date.relativeWithPlurals', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_bn', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.NumberFormatSymbols', 'goog.i18n.NumberFormatSymbols_bn', 'goog.i18n.NumberFormatSymbols_en', 'goog.i18n.NumberFormatSymbols_fa'], false);
goog.addDependency('date/utcdatetime.js', ['goog.date.UtcDateTime'], ['goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval'], false);
goog.addDependency('date/utcdatetime_test.js', ['goog.date.UtcDateTimeTest'], ['goog.date.Interval', 'goog.date.UtcDateTime', 'goog.date.month', 'goog.date.weekDay', 'goog.testing.jsunit'], false);
goog.addDependency('db/cursor.js', ['goog.db.Cursor'], ['goog.async.Deferred', 'goog.db.Error', 'goog.debug', 'goog.events.EventTarget'], false);
goog.addDependency('db/db.js', ['goog.db', 'goog.db.BlockedCallback', 'goog.db.UpgradeNeededCallback'], ['goog.asserts', 'goog.async.Deferred', 'goog.db.Error', 'goog.db.IndexedDb', 'goog.db.Transaction'], false);
goog.addDependency('db/db_test.js', ['goog.dbTest'], ['goog.Disposable', 'goog.Promise', 'goog.array', 'goog.db', 'goog.db.Cursor', 'goog.db.Error', 'goog.db.IndexedDb', 'goog.db.KeyRange', 'goog.db.Transaction', 'goog.events', 'goog.object', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent.product'], false);
goog.addDependency('db/error.js', ['goog.db.Error', 'goog.db.Error.ErrorCode', 'goog.db.Error.ErrorName', 'goog.db.Error.VersionChangeBlockedError'], ['goog.debug.Error'], false);
goog.addDependency('db/index.js', ['goog.db.Index'], ['goog.async.Deferred', 'goog.db.Cursor', 'goog.db.Error', 'goog.debug'], false);
goog.addDependency('db/indexeddb.js', ['goog.db.IndexedDb'], ['goog.db.Error', 'goog.db.ObjectStore', 'goog.db.Transaction', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget'], false);
goog.addDependency('db/keyrange.js', ['goog.db.KeyRange'], [], false);
goog.addDependency('db/objectstore.js', ['goog.db.ObjectStore'], ['goog.async.Deferred', 'goog.db.Cursor', 'goog.db.Error', 'goog.db.Index', 'goog.debug', 'goog.events'], false);
goog.addDependency('db/transaction.js', ['goog.db.Transaction', 'goog.db.Transaction.TransactionMode'], ['goog.async.Deferred', 'goog.db.Error', 'goog.db.ObjectStore', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget'], false);
goog.addDependency('debug/console.js', ['goog.debug.Console'], ['goog.debug.LogManager', 'goog.debug.Logger', 'goog.debug.TextFormatter'], false);
goog.addDependency('debug/console_test.js', ['goog.debug.ConsoleTest'], ['goog.debug.Console', 'goog.debug.LogRecord', 'goog.debug.Logger', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('debug/debug.js', ['goog.debug'], ['goog.array', 'goog.html.SafeHtml', 'goog.html.SafeUrl', 'goog.html.uncheckedconversions', 'goog.string.Const', 'goog.structs.Set', 'goog.userAgent'], false);
goog.addDependency('debug/debug_test.js', ['goog.debugTest'], ['goog.debug', 'goog.html.SafeHtml', 'goog.structs.Set', 'goog.testing.jsunit'], false);
goog.addDependency('debug/debugwindow.js', ['goog.debug.DebugWindow'], ['goog.debug.HtmlFormatter', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.html.SafeStyleSheet', 'goog.string.Const', 'goog.structs.CircularBuffer', 'goog.userAgent'], false);
goog.addDependency('debug/debugwindow_test.js', ['goog.debug.DebugWindowTest'], ['goog.debug.DebugWindow', 'goog.testing.jsunit'], false);
goog.addDependency('debug/devcss/devcss.js', ['goog.debug.DevCss', 'goog.debug.DevCss.UserAgent'], ['goog.asserts', 'goog.cssom', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('debug/devcss/devcss_test.js', ['goog.debug.DevCssTest'], ['goog.debug.DevCss', 'goog.style', 'goog.testing.jsunit'], false);
goog.addDependency('debug/devcss/devcssrunner.js', ['goog.debug.devCssRunner'], ['goog.debug.DevCss'], false);
goog.addDependency('debug/divconsole.js', ['goog.debug.DivConsole'], ['goog.debug.HtmlFormatter', 'goog.debug.LogManager', 'goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.style'], false);
goog.addDependency('debug/enhanceerror_test.js', ['goog.debugEnhanceErrorTest'], ['goog.debug', 'goog.testing.jsunit'], false);
goog.addDependency('debug/entrypointregistry.js', ['goog.debug.EntryPointMonitor', 'goog.debug.entryPointRegistry'], ['goog.asserts'], false);
goog.addDependency('debug/entrypointregistry_test.js', ['goog.debug.entryPointRegistryTest'], ['goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.testing.jsunit'], false);
goog.addDependency('debug/error.js', ['goog.debug.Error'], [], false);
goog.addDependency('debug/error_test.js', ['goog.debug.ErrorTest'], ['goog.debug.Error', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('debug/errorhandler.js', ['goog.debug.ErrorHandler', 'goog.debug.ErrorHandler.ProtectedFunctionError'], ['goog.Disposable', 'goog.asserts', 'goog.debug', 'goog.debug.EntryPointMonitor', 'goog.debug.Error', 'goog.debug.Trace'], false);
goog.addDependency('debug/errorhandler_async_test.js', ['goog.debug.ErrorHandlerAsyncTest'], ['goog.Promise', 'goog.debug.ErrorHandler', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('debug/errorhandler_test.js', ['goog.debug.ErrorHandlerTest'], ['goog.debug.ErrorHandler', 'goog.testing.MockControl', 'goog.testing.jsunit'], false);
goog.addDependency('debug/errorhandlerweakdep.js', ['goog.debug.errorHandlerWeakDep'], [], false);
goog.addDependency('debug/errorreporter.js', ['goog.debug.ErrorReporter', 'goog.debug.ErrorReporter.ExceptionEvent'], ['goog.asserts', 'goog.debug', 'goog.debug.Error', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.log', 'goog.net.XhrIo', 'goog.object', 'goog.string', 'goog.uri.utils', 'goog.userAgent'], false);
goog.addDependency('debug/errorreporter_test.js', ['goog.debug.ErrorReporterTest'], ['goog.debug.Error', 'goog.debug.ErrorReporter', 'goog.events', 'goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('debug/fancywindow.js', ['goog.debug.FancyWindow'], ['goog.array', 'goog.debug.DebugWindow', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.dom.DomHelper', 'goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.html.SafeStyleSheet', 'goog.object', 'goog.string', 'goog.string.Const', 'goog.userAgent'], false);
goog.addDependency('debug/formatter.js', ['goog.debug.Formatter', 'goog.debug.HtmlFormatter', 'goog.debug.TextFormatter'], ['goog.debug', 'goog.debug.Logger', 'goog.debug.RelativeTimeProvider', 'goog.html.SafeHtml'], false);
goog.addDependency('debug/formatter_test.js', ['goog.debug.FormatterTest'], ['goog.debug.HtmlFormatter', 'goog.debug.LogRecord', 'goog.debug.Logger', 'goog.html.SafeHtml', 'goog.testing.jsunit'], false);
goog.addDependency('debug/fpsdisplay.js', ['goog.debug.FpsDisplay'], ['goog.asserts', 'goog.async.AnimationDelay', 'goog.dom', 'goog.dom.TagName', 'goog.ui.Component'], false);
goog.addDependency('debug/fpsdisplay_test.js', ['goog.debug.FpsDisplayTest'], ['goog.Timer', 'goog.debug.FpsDisplay', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('debug/logbuffer.js', ['goog.debug.LogBuffer'], ['goog.asserts', 'goog.debug.LogRecord'], false);
goog.addDependency('debug/logbuffer_test.js', ['goog.debug.LogBufferTest'], ['goog.debug.LogBuffer', 'goog.debug.Logger', 'goog.testing.jsunit'], false);
goog.addDependency('debug/logger.js', ['goog.debug.LogManager', 'goog.debug.Loggable', 'goog.debug.Logger', 'goog.debug.Logger.Level'], ['goog.array', 'goog.asserts', 'goog.debug', 'goog.debug.LogBuffer', 'goog.debug.LogRecord'], false);
goog.addDependency('debug/logger_test.js', ['goog.debug.LoggerTest'], ['goog.debug.LogManager', 'goog.debug.Logger', 'goog.testing.jsunit'], false);
goog.addDependency('debug/logrecord.js', ['goog.debug.LogRecord'], [], false);
goog.addDependency('debug/logrecordserializer.js', ['goog.debug.logRecordSerializer'], ['goog.debug.LogRecord', 'goog.debug.Logger', 'goog.json', 'goog.object'], false);
goog.addDependency('debug/logrecordserializer_test.js', ['goog.debug.logRecordSerializerTest'], ['goog.debug.LogRecord', 'goog.debug.Logger', 'goog.debug.logRecordSerializer', 'goog.testing.jsunit'], false);
goog.addDependency('debug/relativetimeprovider.js', ['goog.debug.RelativeTimeProvider'], [], false);
goog.addDependency('debug/tracer.js', ['goog.debug.Trace'], ['goog.array', 'goog.debug.Logger', 'goog.iter', 'goog.log', 'goog.structs.Map', 'goog.structs.SimplePool'], false);
goog.addDependency('debug/tracer_test.js', ['goog.debug.TraceTest'], ['goog.debug.Trace', 'goog.testing.jsunit'], false);
goog.addDependency('defineclass_test.js', ['goog.defineClassTest'], ['goog.testing.jsunit'], false);
goog.addDependency('disposable/disposable.js', ['goog.Disposable', 'goog.dispose', 'goog.disposeAll'], ['goog.disposable.IDisposable'], false);
goog.addDependency('disposable/disposable_test.js', ['goog.DisposableTest'], ['goog.Disposable', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('disposable/idisposable.js', ['goog.disposable.IDisposable'], [], false);
goog.addDependency('dom/abstractmultirange.js', ['goog.dom.AbstractMultiRange'], ['goog.array', 'goog.dom', 'goog.dom.AbstractRange'], false);
goog.addDependency('dom/abstractrange.js', ['goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.SavedCaretRange', 'goog.dom.TagIterator', 'goog.userAgent'], false);
goog.addDependency('dom/abstractrange_test.js', ['goog.dom.AbstractRangeTest'], ['goog.dom', 'goog.dom.AbstractRange', 'goog.dom.Range', 'goog.dom.TagName', 'goog.testing.jsunit'], false);
goog.addDependency('dom/animationframe/animationframe.js', ['goog.dom.animationFrame', 'goog.dom.animationFrame.Spec', 'goog.dom.animationFrame.State'], ['goog.dom.animationFrame.polyfill'], false);
goog.addDependency('dom/animationframe/polyfill.js', ['goog.dom.animationFrame.polyfill'], [], false);
goog.addDependency('dom/annotate.js', ['goog.dom.annotate', 'goog.dom.annotate.AnnotateFn'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeHtml'], false);
goog.addDependency('dom/annotate_test.js', ['goog.dom.annotateTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.annotate', 'goog.html.SafeHtml', 'goog.testing.jsunit'], false);
goog.addDependency('dom/browserfeature.js', ['goog.dom.BrowserFeature'], ['goog.userAgent'], false);
goog.addDependency('dom/browserrange/abstractrange.js', ['goog.dom.browserrange.AbstractRange'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.iter', 'goog.math.Coordinate', 'goog.string', 'goog.string.StringBuffer', 'goog.userAgent'], false);
goog.addDependency('dom/browserrange/browserrange.js', ['goog.dom.browserrange', 'goog.dom.browserrange.Error'], ['goog.dom', 'goog.dom.BrowserFeature', 'goog.dom.NodeType', 'goog.dom.browserrange.GeckoRange', 'goog.dom.browserrange.IeRange', 'goog.dom.browserrange.OperaRange', 'goog.dom.browserrange.W3cRange', 'goog.dom.browserrange.WebKitRange', 'goog.userAgent'], false);
goog.addDependency('dom/browserrange/browserrange_test.js', ['goog.dom.browserrangeTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.browserrange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('dom/browserrange/geckorange.js', ['goog.dom.browserrange.GeckoRange'], ['goog.dom.browserrange.W3cRange'], false);
goog.addDependency('dom/browserrange/ierange.js', ['goog.dom.browserrange.IeRange'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.browserrange.AbstractRange', 'goog.log', 'goog.string'], false);
goog.addDependency('dom/browserrange/operarange.js', ['goog.dom.browserrange.OperaRange'], ['goog.dom.browserrange.W3cRange'], false);
goog.addDependency('dom/browserrange/w3crange.js', ['goog.dom.browserrange.W3cRange'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.browserrange.AbstractRange', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('dom/browserrange/webkitrange.js', ['goog.dom.browserrange.WebKitRange'], ['goog.dom.RangeEndpoint', 'goog.dom.browserrange.W3cRange', 'goog.userAgent'], false);
goog.addDependency('dom/bufferedviewportsizemonitor.js', ['goog.dom.BufferedViewportSizeMonitor'], ['goog.asserts', 'goog.async.Delay', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType'], false);
goog.addDependency('dom/bufferedviewportsizemonitor_test.js', ['goog.dom.BufferedViewportSizeMonitorTest'], ['goog.dom.BufferedViewportSizeMonitor', 'goog.dom.ViewportSizeMonitor', 'goog.events', 'goog.events.EventType', 'goog.math.Size', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit'], false);
goog.addDependency('dom/classes.js', ['goog.dom.classes'], ['goog.array'], false);
goog.addDependency('dom/classes_test.js', ['goog.dom.classes_test'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classes', 'goog.testing.jsunit'], false);
goog.addDependency('dom/classlist.js', ['goog.dom.classlist'], ['goog.array'], false);
goog.addDependency('dom/classlist_test.js', ['goog.dom.classlist_test'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit'], false);
goog.addDependency('dom/controlrange.js', ['goog.dom.ControlRange', 'goog.dom.ControlRangeIterator'], ['goog.array', 'goog.dom', 'goog.dom.AbstractMultiRange', 'goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TagWalkType', 'goog.dom.TextRange', 'goog.iter.StopIteration', 'goog.userAgent'], false);
goog.addDependency('dom/controlrange_test.js', ['goog.dom.ControlRangeTest'], ['goog.dom', 'goog.dom.ControlRange', 'goog.dom.RangeType', 'goog.dom.TagName', 'goog.dom.TextRange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('dom/dataset.js', ['goog.dom.dataset'], ['goog.string', 'goog.userAgent.product'], false);
goog.addDependency('dom/dataset_test.js', ['goog.dom.datasetTest'], ['goog.dom', 'goog.dom.dataset', 'goog.testing.jsunit'], false);
goog.addDependency('dom/dom.js', ['goog.dom', 'goog.dom.Appendable', 'goog.dom.DomHelper'], ['goog.array', 'goog.asserts', 'goog.dom.BrowserFeature', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.math.Coordinate', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.userAgent'], false);
goog.addDependency('dom/dom_test.js', ['goog.dom.dom_test'], ['goog.dom', 'goog.dom.BrowserFeature', 'goog.dom.DomHelper', 'goog.dom.InputType', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.functions', 'goog.html.testing', 'goog.object', 'goog.string.Unicode', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('dom/fontsizemonitor.js', ['goog.dom.FontSizeMonitor', 'goog.dom.FontSizeMonitor.EventType'], ['goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.userAgent'], false);
goog.addDependency('dom/fontsizemonitor_test.js', ['goog.dom.FontSizeMonitorTest'], ['goog.dom', 'goog.dom.FontSizeMonitor', 'goog.dom.TagName', 'goog.events', 'goog.events.Event', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('dom/forms.js', ['goog.dom.forms'], ['goog.dom.InputType', 'goog.dom.TagName', 'goog.structs.Map'], false);
goog.addDependency('dom/forms_test.js', ['goog.dom.formsTest'], ['goog.dom', 'goog.dom.forms', 'goog.testing.jsunit'], false);
goog.addDependency('dom/fullscreen.js', ['goog.dom.fullscreen', 'goog.dom.fullscreen.EventType'], ['goog.dom', 'goog.userAgent'], false);
goog.addDependency('dom/fullscreen_test.js', ['goog.dom.fullscreen_test'], ['goog.dom.DomHelper', 'goog.dom.fullscreen', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('dom/iframe.js', ['goog.dom.iframe'], ['goog.dom', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.legacyconversions', 'goog.userAgent'], false);
goog.addDependency('dom/iframe_test.js', ['goog.dom.iframeTest'], ['goog.dom', 'goog.dom.iframe', 'goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('dom/inputtype.js', ['goog.dom.InputType'], [], false);
goog.addDependency('dom/inputtype_test.js', ['goog.dom.InputTypeTest'], ['goog.dom.InputType', 'goog.object'], false);
goog.addDependency('dom/iter.js', ['goog.dom.iter.AncestorIterator', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator'], ['goog.iter.Iterator', 'goog.iter.StopIteration'], false);
goog.addDependency('dom/iter_test.js', ['goog.dom.iterTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.iter.AncestorIterator', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator', 'goog.testing.dom', 'goog.testing.jsunit'], false);
goog.addDependency('dom/multirange.js', ['goog.dom.MultiRange', 'goog.dom.MultiRangeIterator'], ['goog.array', 'goog.dom.AbstractMultiRange', 'goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TextRange', 'goog.iter.StopIteration', 'goog.log'], false);
goog.addDependency('dom/multirange_test.js', ['goog.dom.MultiRangeTest'], ['goog.dom', 'goog.dom.MultiRange', 'goog.dom.Range', 'goog.iter', 'goog.testing.jsunit'], false);
goog.addDependency('dom/nodeiterator.js', ['goog.dom.NodeIterator'], ['goog.dom.TagIterator'], false);
goog.addDependency('dom/nodeiterator_test.js', ['goog.dom.NodeIteratorTest'], ['goog.dom', 'goog.dom.NodeIterator', 'goog.testing.dom', 'goog.testing.jsunit'], false);
goog.addDependency('dom/nodeoffset.js', ['goog.dom.NodeOffset'], ['goog.Disposable', 'goog.dom.TagName'], false);
goog.addDependency('dom/nodeoffset_test.js', ['goog.dom.NodeOffsetTest'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.testing.jsunit'], false);
goog.addDependency('dom/nodetype.js', ['goog.dom.NodeType'], [], false);
goog.addDependency('dom/pattern/abstractpattern.js', ['goog.dom.pattern.AbstractPattern'], ['goog.dom.pattern.MatchType'], false);
goog.addDependency('dom/pattern/allchildren.js', ['goog.dom.pattern.AllChildren'], ['goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType'], false);
goog.addDependency('dom/pattern/callback/callback.js', ['goog.dom.pattern.callback'], ['goog.dom', 'goog.dom.TagWalkType', 'goog.iter'], false);
goog.addDependency('dom/pattern/callback/counter.js', ['goog.dom.pattern.callback.Counter'], [], false);
goog.addDependency('dom/pattern/callback/test.js', ['goog.dom.pattern.callback.Test'], ['goog.iter.StopIteration'], false);
goog.addDependency('dom/pattern/childmatches.js', ['goog.dom.pattern.ChildMatches'], ['goog.dom.pattern.AllChildren', 'goog.dom.pattern.MatchType'], false);
goog.addDependency('dom/pattern/endtag.js', ['goog.dom.pattern.EndTag'], ['goog.dom.TagWalkType', 'goog.dom.pattern.Tag'], false);
goog.addDependency('dom/pattern/fulltag.js', ['goog.dom.pattern.FullTag'], ['goog.dom.pattern.MatchType', 'goog.dom.pattern.StartTag', 'goog.dom.pattern.Tag'], false);
goog.addDependency('dom/pattern/matcher.js', ['goog.dom.pattern.Matcher'], ['goog.dom.TagIterator', 'goog.dom.pattern.MatchType', 'goog.iter'], false);
goog.addDependency('dom/pattern/matcher_test.js', ['goog.dom.pattern.matcherTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.pattern.EndTag', 'goog.dom.pattern.FullTag', 'goog.dom.pattern.Matcher', 'goog.dom.pattern.Repeat', 'goog.dom.pattern.Sequence', 'goog.dom.pattern.StartTag', 'goog.dom.pattern.callback.Counter', 'goog.dom.pattern.callback.Test', 'goog.iter.StopIteration', 'goog.testing.jsunit'], false);
goog.addDependency('dom/pattern/nodetype.js', ['goog.dom.pattern.NodeType'], ['goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType'], false);
goog.addDependency('dom/pattern/pattern.js', ['goog.dom.pattern', 'goog.dom.pattern.MatchType'], [], false);
goog.addDependency('dom/pattern/pattern_test.js', ['goog.dom.patternTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagWalkType', 'goog.dom.pattern.AllChildren', 'goog.dom.pattern.ChildMatches', 'goog.dom.pattern.EndTag', 'goog.dom.pattern.FullTag', 'goog.dom.pattern.MatchType', 'goog.dom.pattern.NodeType', 'goog.dom.pattern.Repeat', 'goog.dom.pattern.Sequence', 'goog.dom.pattern.StartTag', 'goog.dom.pattern.Text', 'goog.testing.jsunit'], false);
goog.addDependency('dom/pattern/repeat.js', ['goog.dom.pattern.Repeat'], ['goog.dom.NodeType', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType'], false);
goog.addDependency('dom/pattern/sequence.js', ['goog.dom.pattern.Sequence'], ['goog.dom.NodeType', 'goog.dom.pattern', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType'], false);
goog.addDependency('dom/pattern/starttag.js', ['goog.dom.pattern.StartTag'], ['goog.dom.TagWalkType', 'goog.dom.pattern.Tag'], false);
goog.addDependency('dom/pattern/tag.js', ['goog.dom.pattern.Tag'], ['goog.dom.pattern', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType', 'goog.object'], false);
goog.addDependency('dom/pattern/text.js', ['goog.dom.pattern.Text'], ['goog.dom.NodeType', 'goog.dom.pattern', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType'], false);
goog.addDependency('dom/range.js', ['goog.dom.Range'], ['goog.dom', 'goog.dom.AbstractRange', 'goog.dom.BrowserFeature', 'goog.dom.ControlRange', 'goog.dom.MultiRange', 'goog.dom.NodeType', 'goog.dom.TextRange'], false);
goog.addDependency('dom/range_test.js', ['goog.dom.RangeTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.RangeType', 'goog.dom.TagName', 'goog.dom.TextRange', 'goog.dom.browserrange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('dom/rangeendpoint.js', ['goog.dom.RangeEndpoint'], [], false);
goog.addDependency('dom/safe.js', ['goog.dom.safe', 'goog.dom.safe.InsertAdjacentHtmlPosition'], ['goog.asserts', 'goog.html.SafeHtml', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.string', 'goog.string.Const'], false);
goog.addDependency('dom/safe_test.js', ['goog.dom.safeTest'], ['goog.dom.safe', 'goog.dom.safe.InsertAdjacentHtmlPosition', 'goog.html.SafeHtml', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.html.testing', 'goog.string.Const', 'goog.testing', 'goog.testing.jsunit'], false);
goog.addDependency('dom/savedcaretrange.js', ['goog.dom.SavedCaretRange'], ['goog.array', 'goog.dom', 'goog.dom.SavedRange', 'goog.dom.TagName', 'goog.string'], false);
goog.addDependency('dom/savedcaretrange_test.js', ['goog.dom.SavedCaretRangeTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.SavedCaretRange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('dom/savedrange.js', ['goog.dom.SavedRange'], ['goog.Disposable', 'goog.log'], false);
goog.addDependency('dom/savedrange_test.js', ['goog.dom.SavedRangeTest'], ['goog.dom', 'goog.dom.Range', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('dom/selection.js', ['goog.dom.selection'], ['goog.dom.InputType', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('dom/selection_test.js', ['goog.dom.selectionTest'], ['goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.selection', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('dom/tagiterator.js', ['goog.dom.TagIterator', 'goog.dom.TagWalkType'], ['goog.dom', 'goog.dom.NodeType', 'goog.iter.Iterator', 'goog.iter.StopIteration'], false);
goog.addDependency('dom/tagiterator_test.js', ['goog.dom.TagIteratorTest'], ['goog.dom', 'goog.dom.TagIterator', 'goog.dom.TagName', 'goog.dom.TagWalkType', 'goog.iter', 'goog.iter.StopIteration', 'goog.testing.dom', 'goog.testing.jsunit'], false);
goog.addDependency('dom/tagname.js', ['goog.dom.TagName'], [], false);
goog.addDependency('dom/tagname_test.js', ['goog.dom.TagNameTest'], ['goog.dom.TagName', 'goog.object', 'goog.testing.jsunit'], false);
goog.addDependency('dom/tags.js', ['goog.dom.tags'], ['goog.object'], false);
goog.addDependency('dom/tags_test.js', ['goog.dom.tagsTest'], ['goog.dom.tags', 'goog.testing.jsunit'], false);
goog.addDependency('dom/textrange.js', ['goog.dom.TextRange'], ['goog.array', 'goog.dom', 'goog.dom.AbstractRange', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.dom.browserrange', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('dom/textrange_test.js', ['goog.dom.TextRangeTest'], ['goog.dom', 'goog.dom.ControlRange', 'goog.dom.Range', 'goog.dom.TextRange', 'goog.math.Coordinate', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('dom/textrangeiterator.js', ['goog.dom.TextRangeIterator'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeIterator', 'goog.dom.TagName', 'goog.iter.StopIteration'], false);
goog.addDependency('dom/textrangeiterator_test.js', ['goog.dom.TextRangeIteratorTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.iter.StopIteration', 'goog.testing.dom', 'goog.testing.jsunit'], false);
goog.addDependency('dom/vendor.js', ['goog.dom.vendor'], ['goog.string', 'goog.userAgent'], false);
goog.addDependency('dom/vendor_test.js', ['goog.dom.vendorTest'], ['goog.array', 'goog.dom.vendor', 'goog.labs.userAgent.util', 'goog.testing.MockUserAgent', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgentTestUtil'], false);
goog.addDependency('dom/viewportsizemonitor.js', ['goog.dom.ViewportSizeMonitor'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Size'], false);
goog.addDependency('dom/viewportsizemonitor_test.js', ['goog.dom.ViewportSizeMonitorTest'], ['goog.dom.ViewportSizeMonitor', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Size', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('dom/xml.js', ['goog.dom.xml'], ['goog.dom', 'goog.dom.NodeType', 'goog.userAgent'], false);
goog.addDependency('dom/xml_test.js', ['goog.dom.xmlTest'], ['goog.dom.TagName', 'goog.dom.xml', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/browserfeature.js', ['goog.editor.BrowserFeature'], ['goog.editor.defines', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('editor/browserfeature_test.js', ['goog.editor.BrowserFeatureTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit'], false);
goog.addDependency('editor/clicktoeditwrapper.js', ['goog.editor.ClickToEditWrapper'], ['goog.Disposable', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.range', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventType'], false);
goog.addDependency('editor/clicktoeditwrapper_test.js', ['goog.editor.ClickToEditWrapperTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.ClickToEditWrapper', 'goog.editor.SeamlessField', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('editor/command.js', ['goog.editor.Command'], [], false);
goog.addDependency('editor/contenteditablefield.js', ['goog.editor.ContentEditableField'], ['goog.asserts', 'goog.editor.Field', 'goog.log'], false);
goog.addDependency('editor/contenteditablefield_test.js', ['goog.editor.ContentEditableFieldTest'], ['goog.dom', 'goog.editor.ContentEditableField', 'goog.editor.field_test', 'goog.testing.jsunit'], false);
goog.addDependency('editor/defines.js', ['goog.editor.defines'], [], false);
goog.addDependency('editor/field.js', ['goog.editor.Field', 'goog.editor.Field.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.array', 'goog.asserts', 'goog.async.Delay', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.editor.node', 'goog.editor.range', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.functions', 'goog.log', 'goog.log.Level', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('editor/field_test.js', ['goog.editor.field_test'], ['goog.array', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.range', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.functions', 'goog.testing.LooseMock', 'goog.testing.MockClock', 'goog.testing.dom', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('editor/focus.js', ['goog.editor.focus'], ['goog.dom.selection'], false);
goog.addDependency('editor/focus_test.js', ['goog.editor.focusTest'], ['goog.dom.selection', 'goog.editor.BrowserFeature', 'goog.editor.focus', 'goog.testing.jsunit'], false);
goog.addDependency('editor/icontent.js', ['goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo'], ['goog.dom', 'goog.editor.BrowserFeature', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('editor/icontent_test.js', ['goog.editor.icontentTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/link.js', ['goog.editor.Link'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.node', 'goog.editor.range', 'goog.string', 'goog.string.Unicode', 'goog.uri.utils', 'goog.uri.utils.ComponentIndex'], false);
goog.addDependency('editor/link_test.js', ['goog.editor.LinkTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Link', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/node.js', ['goog.editor.node'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator', 'goog.iter', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.userAgent'], false);
goog.addDependency('editor/node_test.js', ['goog.editor.nodeTest'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.editor.node', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugin.js', ['goog.editor.Plugin'], ['goog.events.EventTarget', 'goog.functions', 'goog.log', 'goog.object', 'goog.reflect', 'goog.userAgent'], false);
goog.addDependency('editor/plugin_test.js', ['goog.editor.PluginTest'], ['goog.editor.Field', 'goog.editor.Plugin', 'goog.functions', 'goog.testing.StrictMock', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/abstractbubbleplugin.js', ['goog.editor.plugins.AbstractBubblePlugin'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.editor.Plugin', 'goog.editor.style', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.actionEventWrapper', 'goog.functions', 'goog.string.Unicode', 'goog.ui.Component', 'goog.ui.editor.Bubble', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/abstractbubbleplugin_test.js', ['goog.editor.plugins.AbstractBubblePluginTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.events.BrowserEvent', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.functions', 'goog.style', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.ui.editor.Bubble', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/abstractdialogplugin.js', ['goog.editor.plugins.AbstractDialogPlugin', 'goog.editor.plugins.AbstractDialogPlugin.EventType'], ['goog.dom', 'goog.dom.Range', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.range', 'goog.events', 'goog.ui.editor.AbstractDialog'], false);
goog.addDependency('editor/plugins/abstractdialogplugin_test.js', ['goog.editor.plugins.AbstractDialogPluginTest'], ['goog.dom.SavedRange', 'goog.dom.TagName', 'goog.editor.Field', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.events.Event', 'goog.events.EventHandler', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.ui.editor.AbstractDialog', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/abstracttabhandler.js', ['goog.editor.plugins.AbstractTabHandler'], ['goog.editor.Plugin', 'goog.events.KeyCodes', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/abstracttabhandler_test.js', ['goog.editor.plugins.AbstractTabHandlerTest'], ['goog.editor.Field', 'goog.editor.plugins.AbstractTabHandler', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.testing.StrictMock', 'goog.testing.editor.FieldMock', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/basictextformatter.js', ['goog.editor.plugins.BasicTextFormatter', 'goog.editor.plugins.BasicTextFormatter.COMMAND'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.editor.style', 'goog.iter', 'goog.iter.StopIteration', 'goog.log', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.editor.messages', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/basictextformatter_test.js', ['goog.editor.plugins.BasicTextFormatterTest'], ['goog.array', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.plugins.BasicTextFormatter', 'goog.object', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.LooseMock', 'goog.testing.PropertyReplacer', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/blockquote.js', ['goog.editor.plugins.Blockquote'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.node', 'goog.functions', 'goog.log'], false);
goog.addDependency('editor/plugins/blockquote_test.js', ['goog.editor.plugins.BlockquoteTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.plugins.Blockquote', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit'], false);
goog.addDependency('editor/plugins/emoticons.js', ['goog.editor.plugins.Emoticons'], ['goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.range', 'goog.functions', 'goog.ui.emoji.Emoji', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/emoticons_test.js', ['goog.editor.plugins.EmoticonsTest'], ['goog.Uri', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.editor.Field', 'goog.editor.plugins.Emoticons', 'goog.testing.jsunit', 'goog.ui.emoji.Emoji', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/enterhandler.js', ['goog.editor.plugins.EnterHandler'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.plugins.Blockquote', 'goog.editor.range', 'goog.editor.style', 'goog.events.KeyCodes', 'goog.functions', 'goog.object', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/enterhandler_test.js', ['goog.editor.plugins.EnterHandlerTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.plugins.Blockquote', 'goog.editor.plugins.EnterHandler', 'goog.editor.range', 'goog.events', 'goog.events.KeyCodes', 'goog.testing.ExpectedFailures', 'goog.testing.MockClock', 'goog.testing.dom', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/firststrong.js', ['goog.editor.plugins.FirstStrong'], ['goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.i18n.bidi', 'goog.i18n.uChar', 'goog.iter', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/firststrong_test.js', ['goog.editor.plugins.FirstStrongTest'], ['goog.dom.Range', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.plugins.FirstStrong', 'goog.editor.range', 'goog.events.KeyCodes', 'goog.testing.MockClock', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/headerformatter.js', ['goog.editor.plugins.HeaderFormatter'], ['goog.editor.Command', 'goog.editor.Plugin', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/headerformatter_test.js', ['goog.editor.plugins.HeaderFormatterTest'], ['goog.dom', 'goog.editor.Command', 'goog.editor.plugins.BasicTextFormatter', 'goog.editor.plugins.HeaderFormatter', 'goog.events.BrowserEvent', 'goog.testing.LooseMock', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/linkbubble.js', ['goog.editor.plugins.LinkBubble', 'goog.editor.plugins.LinkBubble.Action'], ['goog.array', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.functions', 'goog.string', 'goog.style', 'goog.ui.editor.messages', 'goog.uri.utils', 'goog.window'], false);
goog.addDependency('editor/plugins/linkbubble_test.js', ['goog.editor.plugins.LinkBubbleTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.plugins.LinkBubble', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.string', 'goog.style', 'goog.testing.FunctionMock', 'goog.testing.PropertyReplacer', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/linkdialogplugin.js', ['goog.editor.plugins.LinkDialogPlugin'], ['goog.array', 'goog.dom', 'goog.editor.Command', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.events.EventHandler', 'goog.functions', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.LinkDialog', 'goog.uri.utils'], false);
goog.addDependency('editor/plugins/linkdialogplugin_test.js', ['goog.ui.editor.plugins.LinkDialogTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.Link', 'goog.editor.plugins.LinkDialogPlugin', 'goog.string', 'goog.string.Unicode', 'goog.testing.MockControl', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.editor.dom', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.LinkDialog', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/linkshortcutplugin.js', ['goog.editor.plugins.LinkShortcutPlugin'], ['goog.editor.Command', 'goog.editor.Plugin'], false);
goog.addDependency('editor/plugins/linkshortcutplugin_test.js', ['goog.editor.plugins.LinkShortcutPluginTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.Field', 'goog.editor.plugins.BasicTextFormatter', 'goog.editor.plugins.LinkBubble', 'goog.editor.plugins.LinkShortcutPlugin', 'goog.events.KeyCodes', 'goog.testing.PropertyReplacer', 'goog.testing.dom', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent.product'], false);
goog.addDependency('editor/plugins/listtabhandler.js', ['goog.editor.plugins.ListTabHandler'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.plugins.AbstractTabHandler', 'goog.iter'], false);
goog.addDependency('editor/plugins/listtabhandler_test.js', ['goog.editor.plugins.ListTabHandlerTest'], ['goog.dom', 'goog.editor.Command', 'goog.editor.plugins.ListTabHandler', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.functions', 'goog.testing.StrictMock', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit'], false);
goog.addDependency('editor/plugins/loremipsum.js', ['goog.editor.plugins.LoremIpsum'], ['goog.asserts', 'goog.dom', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.node', 'goog.functions', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/loremipsum_test.js', ['goog.editor.plugins.LoremIpsumTest'], ['goog.dom', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.plugins.LoremIpsum', 'goog.string.Unicode', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/removeformatting.js', ['goog.editor.plugins.RemoveFormatting'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/removeformatting_test.js', ['goog.editor.plugins.RemoveFormattingTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.plugins.RemoveFormatting', 'goog.string', 'goog.testing.ExpectedFailures', 'goog.testing.dom', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/spacestabhandler.js', ['goog.editor.plugins.SpacesTabHandler'], ['goog.dom.TagName', 'goog.editor.plugins.AbstractTabHandler', 'goog.editor.range'], false);
goog.addDependency('editor/plugins/spacestabhandler_test.js', ['goog.editor.plugins.SpacesTabHandlerTest'], ['goog.dom', 'goog.dom.Range', 'goog.editor.plugins.SpacesTabHandler', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.functions', 'goog.testing.StrictMock', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit'], false);
goog.addDependency('editor/plugins/tableeditor.js', ['goog.editor.plugins.TableEditor'], ['goog.array', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.Table', 'goog.editor.node', 'goog.editor.range', 'goog.object', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/tableeditor_test.js', ['goog.editor.plugins.TableEditorTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.plugins.TableEditor', 'goog.object', 'goog.string', 'goog.testing.ExpectedFailures', 'goog.testing.JsUnitException', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/tagonenterhandler.js', ['goog.editor.plugins.TagOnEnterHandler'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.node', 'goog.editor.plugins.EnterHandler', 'goog.editor.range', 'goog.editor.style', 'goog.events.KeyCodes', 'goog.functions', 'goog.string.Unicode', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/tagonenterhandler_test.js', ['goog.editor.plugins.TagOnEnterHandlerTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.plugins.TagOnEnterHandler', 'goog.events.KeyCodes', 'goog.string.Unicode', 'goog.testing.dom', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/plugins/undoredo.js', ['goog.editor.plugins.UndoRedo'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoState', 'goog.events', 'goog.events.EventHandler', 'goog.log', 'goog.object'], false);
goog.addDependency('editor/plugins/undoredo_test.js', ['goog.editor.plugins.UndoRedoTest'], ['goog.array', 'goog.dom', 'goog.dom.browserrange', 'goog.editor.Field', 'goog.editor.plugins.LoremIpsum', 'goog.editor.plugins.UndoRedo', 'goog.events', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock', 'goog.testing.jsunit'], false);
goog.addDependency('editor/plugins/undoredomanager.js', ['goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoManager.EventType'], ['goog.editor.plugins.UndoRedoState', 'goog.events', 'goog.events.EventTarget'], false);
goog.addDependency('editor/plugins/undoredomanager_test.js', ['goog.editor.plugins.UndoRedoManagerTest'], ['goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoState', 'goog.events', 'goog.testing.StrictMock', 'goog.testing.jsunit'], false);
goog.addDependency('editor/plugins/undoredostate.js', ['goog.editor.plugins.UndoRedoState'], ['goog.events.EventTarget'], false);
goog.addDependency('editor/plugins/undoredostate_test.js', ['goog.editor.plugins.UndoRedoStateTest'], ['goog.editor.plugins.UndoRedoState', 'goog.testing.jsunit'], false);
goog.addDependency('editor/range.js', ['goog.editor.range', 'goog.editor.range.Point'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.RangeEndpoint', 'goog.dom.SavedCaretRange', 'goog.editor.node', 'goog.editor.style', 'goog.iter', 'goog.userAgent'], false);
goog.addDependency('editor/range_test.js', ['goog.editor.rangeTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.range', 'goog.editor.range.Point', 'goog.string', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('editor/seamlessfield.js', ['goog.editor.SeamlessField'], ['goog.cssom.iframe.style', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.dom.safe', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.editor.node', 'goog.events', 'goog.events.EventType', 'goog.html.uncheckedconversions', 'goog.log', 'goog.string.Const', 'goog.style'], false);
goog.addDependency('editor/seamlessfield_test.js', ['goog.editor.seamlessfield_test'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.SeamlessField', 'goog.events', 'goog.functions', 'goog.style', 'goog.testing.MockClock', 'goog.testing.MockRange', 'goog.testing.jsunit'], false);
goog.addDependency('editor/style.js', ['goog.editor.style'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.events.EventType', 'goog.object', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('editor/style_test.js', ['goog.editor.styleTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.style', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.style', 'goog.testing.LooseMock', 'goog.testing.jsunit', 'goog.testing.mockmatchers'], false);
goog.addDependency('editor/table.js', ['goog.editor.Table', 'goog.editor.TableCell', 'goog.editor.TableRow'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.log', 'goog.string.Unicode', 'goog.style'], false);
goog.addDependency('editor/table_test.js', ['goog.editor.TableTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.Table', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/actioneventwrapper.js', ['goog.events.actionEventWrapper'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.EventWrapper', 'goog.events.KeyCodes', 'goog.userAgent'], false);
goog.addDependency('events/actioneventwrapper_test.js', ['goog.events.actionEventWrapperTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.events', 'goog.events.EventHandler', 'goog.events.KeyCodes', 'goog.events.actionEventWrapper', 'goog.testing.events', 'goog.testing.jsunit'], false);
goog.addDependency('events/actionhandler.js', ['goog.events.ActionEvent', 'goog.events.ActionHandler', 'goog.events.ActionHandler.EventType', 'goog.events.BeforeActionEvent'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent'], false);
goog.addDependency('events/actionhandler_test.js', ['goog.events.ActionHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.ActionHandler', 'goog.testing.events', 'goog.testing.jsunit'], false);
goog.addDependency('events/browserevent.js', ['goog.events.BrowserEvent', 'goog.events.BrowserEvent.MouseButton'], ['goog.events.BrowserFeature', 'goog.events.Event', 'goog.events.EventType', 'goog.reflect', 'goog.userAgent'], false);
goog.addDependency('events/browserevent_test.js', ['goog.events.BrowserEventTest'], ['goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.math.Coordinate', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/browserfeature.js', ['goog.events.BrowserFeature'], ['goog.userAgent'], false);
goog.addDependency('events/event.js', ['goog.events.Event', 'goog.events.EventLike'], ['goog.Disposable', 'goog.events.EventId'], false);
goog.addDependency('events/event_test.js', ['goog.events.EventTest'], ['goog.events.Event', 'goog.events.EventId', 'goog.events.EventTarget', 'goog.testing.jsunit'], false);
goog.addDependency('events/eventhandler.js', ['goog.events.EventHandler'], ['goog.Disposable', 'goog.events', 'goog.object'], false);
goog.addDependency('events/eventhandler_test.js', ['goog.events.EventHandlerTest'], ['goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('events/eventid.js', ['goog.events.EventId'], [], false);
goog.addDependency('events/events.js', ['goog.events', 'goog.events.CaptureSimulationMode', 'goog.events.Key', 'goog.events.ListenableType'], ['goog.asserts', 'goog.debug.entryPointRegistry', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.Listenable', 'goog.events.ListenerMap'], false);
goog.addDependency('events/events_test.js', ['goog.eventsTest'], ['goog.asserts.AssertionError', 'goog.debug.EntryPointMonitor', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.BrowserFeature', 'goog.events.CaptureSimulationMode', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.Listener', 'goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('events/eventtarget.js', ['goog.events.EventTarget'], ['goog.Disposable', 'goog.asserts', 'goog.events', 'goog.events.Event', 'goog.events.Listenable', 'goog.events.ListenerMap', 'goog.object'], false);
goog.addDependency('events/eventtarget_test.js', ['goog.events.EventTargetTest'], ['goog.events.EventTarget', 'goog.events.Listenable', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.testing.jsunit'], false);
goog.addDependency('events/eventtarget_via_googevents_test.js', ['goog.events.EventTargetGoogEventsTest'], ['goog.events', 'goog.events.EventTarget', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.testing', 'goog.testing.jsunit'], false);
goog.addDependency('events/eventtarget_via_w3cinterface_test.js', ['goog.events.EventTargetW3CTest'], ['goog.events.EventTarget', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.testing.jsunit'], false);
goog.addDependency('events/eventtargettester.js', ['goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType'], ['goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.testing.asserts', 'goog.testing.recordFunction'], false);
goog.addDependency('events/eventtype.js', ['goog.events.EventType'], ['goog.userAgent'], false);
goog.addDependency('events/eventwrapper.js', ['goog.events.EventWrapper'], [], false);
goog.addDependency('events/filedrophandler.js', ['goog.events.FileDropHandler', 'goog.events.FileDropHandler.EventType'], ['goog.array', 'goog.dom', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.log', 'goog.log.Level'], false);
goog.addDependency('events/filedrophandler_test.js', ['goog.events.FileDropHandlerTest'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.FileDropHandler', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/focushandler.js', ['goog.events.FocusHandler', 'goog.events.FocusHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.userAgent'], false);
goog.addDependency('events/imehandler.js', ['goog.events.ImeHandler', 'goog.events.ImeHandler.Event', 'goog.events.ImeHandler.EventType'], ['goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent'], false);
goog.addDependency('events/imehandler_test.js', ['goog.events.ImeHandlerTest'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.ImeHandler', 'goog.events.KeyCodes', 'goog.object', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/inputhandler.js', ['goog.events.InputHandler', 'goog.events.InputHandler.EventType'], ['goog.Timer', 'goog.dom.TagName', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.KeyCodes', 'goog.userAgent'], false);
goog.addDependency('events/inputhandler_test.js', ['goog.events.InputHandlerTest'], ['goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('events/keycodes.js', ['goog.events.KeyCodes'], ['goog.userAgent'], false);
goog.addDependency('events/keycodes_test.js', ['goog.events.KeyCodesTest'], ['goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.object', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/keyhandler.js', ['goog.events.KeyEvent', 'goog.events.KeyHandler', 'goog.events.KeyHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent'], false);
goog.addDependency('events/keyhandler_test.js', ['goog.events.KeyEventTest'], ['goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/keynames.js', ['goog.events.KeyNames'], [], false);
goog.addDependency('events/listenable.js', ['goog.events.Listenable', 'goog.events.ListenableKey'], ['goog.events.EventId'], false);
goog.addDependency('events/listenable_test.js', ['goog.events.ListenableTest'], ['goog.events.Listenable', 'goog.testing.jsunit'], false);
goog.addDependency('events/listener.js', ['goog.events.Listener'], ['goog.events.ListenableKey'], false);
goog.addDependency('events/listenermap.js', ['goog.events.ListenerMap'], ['goog.array', 'goog.events.Listener', 'goog.object'], false);
goog.addDependency('events/listenermap_test.js', ['goog.events.ListenerMapTest'], ['goog.dispose', 'goog.events', 'goog.events.EventId', 'goog.events.EventTarget', 'goog.events.ListenerMap', 'goog.testing.jsunit'], false);
goog.addDependency('events/mousewheelhandler.js', ['goog.events.MouseWheelEvent', 'goog.events.MouseWheelHandler', 'goog.events.MouseWheelHandler.EventType'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.math', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('events/mousewheelhandler_test.js', ['goog.events.MouseWheelHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.MouseWheelEvent', 'goog.events.MouseWheelHandler', 'goog.functions', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/onlinehandler.js', ['goog.events.OnlineHandler', 'goog.events.OnlineHandler.EventType'], ['goog.Timer', 'goog.events.BrowserFeature', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.net.NetworkStatusMonitor'], false);
goog.addDependency('events/onlinelistener_test.js', ['goog.events.OnlineHandlerTest'], ['goog.events', 'goog.events.BrowserFeature', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.OnlineHandler', 'goog.net.NetworkStatusMonitor', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('events/pastehandler.js', ['goog.events.PasteHandler', 'goog.events.PasteHandler.EventType', 'goog.events.PasteHandler.State'], ['goog.Timer', 'goog.async.ConditionalDelay', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.log', 'goog.userAgent'], false);
goog.addDependency('events/pastehandler_test.js', ['goog.events.PasteHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.PasteHandler', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('events/wheelevent.js', ['goog.events.WheelEvent'], ['goog.asserts', 'goog.events.BrowserEvent'], false);
goog.addDependency('events/wheelhandler.js', ['goog.events.WheelHandler'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.WheelEvent', 'goog.style', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('events/wheelhandler_test.js', ['goog.events.WheelHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.WheelEvent', 'goog.events.WheelHandler', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('format/emailaddress.js', ['goog.format.EmailAddress'], ['goog.string'], false);
goog.addDependency('format/emailaddress_test.js', ['goog.format.EmailAddressTest'], ['goog.array', 'goog.format.EmailAddress', 'goog.testing.jsunit'], false);
goog.addDependency('format/format.js', ['goog.format'], ['goog.i18n.GraphemeBreak', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('format/format_test.js', ['goog.formatTest'], ['goog.dom', 'goog.dom.TagName', 'goog.format', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('format/htmlprettyprinter.js', ['goog.format.HtmlPrettyPrinter', 'goog.format.HtmlPrettyPrinter.Buffer'], ['goog.dom.TagName', 'goog.object', 'goog.string.StringBuffer'], false);
goog.addDependency('format/htmlprettyprinter_test.js', ['goog.format.HtmlPrettyPrinterTest'], ['goog.format.HtmlPrettyPrinter', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('format/internationalizedemailaddress.js', ['goog.format.InternationalizedEmailAddress'], ['goog.format.EmailAddress', 'goog.string'], false);
goog.addDependency('format/internationalizedemailaddress_test.js', ['goog.format.InternationalizedEmailAddressTest'], ['goog.array', 'goog.format.InternationalizedEmailAddress', 'goog.testing.jsunit'], false);
goog.addDependency('format/jsonprettyprinter.js', ['goog.format.JsonPrettyPrinter', 'goog.format.JsonPrettyPrinter.HtmlDelimiters', 'goog.format.JsonPrettyPrinter.TextDelimiters'], ['goog.json', 'goog.json.Serializer', 'goog.string', 'goog.string.StringBuffer', 'goog.string.format'], false);
goog.addDependency('format/jsonprettyprinter_test.js', ['goog.format.JsonPrettyPrinterTest'], ['goog.format.JsonPrettyPrinter', 'goog.testing.jsunit'], false);
goog.addDependency('fs/entry.js', ['goog.fs.DirectoryEntry', 'goog.fs.DirectoryEntry.Behavior', 'goog.fs.Entry', 'goog.fs.FileEntry'], [], false);
goog.addDependency('fs/entryimpl.js', ['goog.fs.DirectoryEntryImpl', 'goog.fs.EntryImpl', 'goog.fs.FileEntryImpl'], ['goog.array', 'goog.async.Deferred', 'goog.fs.DirectoryEntry', 'goog.fs.Entry', 'goog.fs.Error', 'goog.fs.FileEntry', 'goog.fs.FileWriter', 'goog.functions', 'goog.string'], false);
goog.addDependency('fs/error.js', ['goog.fs.Error', 'goog.fs.Error.ErrorCode'], ['goog.debug.Error', 'goog.object', 'goog.string'], false);
goog.addDependency('fs/filereader.js', ['goog.fs.FileReader', 'goog.fs.FileReader.EventType', 'goog.fs.FileReader.ReadyState'], ['goog.async.Deferred', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.ProgressEvent'], false);
goog.addDependency('fs/filesaver.js', ['goog.fs.FileSaver', 'goog.fs.FileSaver.EventType', 'goog.fs.FileSaver.ReadyState'], ['goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.ProgressEvent'], false);
goog.addDependency('fs/filesystem.js', ['goog.fs.FileSystem'], [], false);
goog.addDependency('fs/filesystemimpl.js', ['goog.fs.FileSystemImpl'], ['goog.fs.DirectoryEntryImpl', 'goog.fs.FileSystem'], false);
goog.addDependency('fs/filewriter.js', ['goog.fs.FileWriter'], ['goog.fs.Error', 'goog.fs.FileSaver'], false);
goog.addDependency('fs/fs.js', ['goog.fs'], ['goog.array', 'goog.async.Deferred', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.fs.FileSystemImpl', 'goog.fs.url', 'goog.userAgent'], false);
goog.addDependency('fs/fs_test.js', ['goog.fsTest'], ['goog.Promise', 'goog.array', 'goog.dom', 'goog.events', 'goog.fs', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.fs.FileSaver', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('fs/progressevent.js', ['goog.fs.ProgressEvent'], ['goog.events.Event'], false);
goog.addDependency('fs/url.js', ['goog.fs.url'], [], false);
goog.addDependency('fs/url_test.js', ['goog.urlTest'], ['goog.fs.url', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('functions/functions.js', ['goog.functions'], [], false);
goog.addDependency('functions/functions_test.js', ['goog.functionsTest'], ['goog.array', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('fx/abstractdragdrop.js', ['goog.fx.AbstractDragDrop', 'goog.fx.AbstractDragDrop.EventType', 'goog.fx.DragDropEvent', 'goog.fx.DragDropItem'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style'], false);
goog.addDependency('fx/abstractdragdrop_test.js', ['goog.fx.AbstractDragDropTest'], ['goog.array', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.functions', 'goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style', 'goog.testing.events', 'goog.testing.jsunit'], false);
goog.addDependency('fx/anim/anim.js', ['goog.fx.anim', 'goog.fx.anim.Animated'], ['goog.async.AnimationDelay', 'goog.async.Delay', 'goog.object'], false);
goog.addDependency('fx/anim/anim_test.js', ['goog.fx.animTest'], ['goog.async.AnimationDelay', 'goog.async.Delay', 'goog.events', 'goog.functions', 'goog.fx.Animation', 'goog.fx.anim', 'goog.object', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('fx/animation.js', ['goog.fx.Animation', 'goog.fx.Animation.EventType', 'goog.fx.Animation.State', 'goog.fx.AnimationEvent'], ['goog.array', 'goog.events.Event', 'goog.fx.Transition', 'goog.fx.TransitionBase', 'goog.fx.anim', 'goog.fx.anim.Animated'], false);
goog.addDependency('fx/animation_test.js', ['goog.fx.AnimationTest'], ['goog.events', 'goog.fx.Animation', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('fx/animationqueue.js', ['goog.fx.AnimationParallelQueue', 'goog.fx.AnimationQueue', 'goog.fx.AnimationSerialQueue'], ['goog.array', 'goog.asserts', 'goog.events', 'goog.fx.Transition', 'goog.fx.TransitionBase'], false);
goog.addDependency('fx/animationqueue_test.js', ['goog.fx.AnimationQueueTest'], ['goog.events', 'goog.fx.Animation', 'goog.fx.AnimationParallelQueue', 'goog.fx.AnimationSerialQueue', 'goog.fx.Transition', 'goog.fx.anim', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('fx/css3/fx.js', ['goog.fx.css3'], ['goog.fx.css3.Transition'], false);
goog.addDependency('fx/css3/transition.js', ['goog.fx.css3.Transition'], ['goog.Timer', 'goog.asserts', 'goog.fx.TransitionBase', 'goog.style', 'goog.style.transition'], false);
goog.addDependency('fx/css3/transition_test.js', ['goog.fx.css3.TransitionTest'], ['goog.dispose', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.fx.Transition', 'goog.fx.css3.Transition', 'goog.style.transition', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('fx/cssspriteanimation.js', ['goog.fx.CssSpriteAnimation'], ['goog.fx.Animation'], false);
goog.addDependency('fx/cssspriteanimation_test.js', ['goog.fx.CssSpriteAnimationTest'], ['goog.fx.CssSpriteAnimation', 'goog.math.Box', 'goog.math.Size', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('fx/dom.js', ['goog.fx.dom', 'goog.fx.dom.BgColorTransform', 'goog.fx.dom.ColorTransform', 'goog.fx.dom.Fade', 'goog.fx.dom.FadeIn', 'goog.fx.dom.FadeInAndShow', 'goog.fx.dom.FadeOut', 'goog.fx.dom.FadeOutAndHide', 'goog.fx.dom.PredefinedEffect', 'goog.fx.dom.Resize', 'goog.fx.dom.ResizeHeight', 'goog.fx.dom.ResizeWidth', 'goog.fx.dom.Scroll', 'goog.fx.dom.Slide', 'goog.fx.dom.SlideFrom', 'goog.fx.dom.Swipe'], ['goog.color', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.style', 'goog.style.bidi'], false);
goog.addDependency('fx/dragdrop.js', ['goog.fx.DragDrop'], ['goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem'], false);
goog.addDependency('fx/dragdropgroup.js', ['goog.fx.DragDropGroup'], ['goog.dom', 'goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem'], false);
goog.addDependency('fx/dragdropgroup_test.js', ['goog.fx.DragDropGroupTest'], ['goog.events', 'goog.fx.DragDropGroup', 'goog.testing.jsunit'], false);
goog.addDependency('fx/dragger.js', ['goog.fx.DragEvent', 'goog.fx.Dragger', 'goog.fx.Dragger.EventType'], ['goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.style', 'goog.style.bidi', 'goog.userAgent'], false);
goog.addDependency('fx/dragger_test.js', ['goog.fx.DraggerTest'], ['goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Rect', 'goog.style.bidi', 'goog.testing.StrictMock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('fx/draglistgroup.js', ['goog.fx.DragListDirection', 'goog.fx.DragListGroup', 'goog.fx.DragListGroup.EventType', 'goog.fx.DragListGroupEvent'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Coordinate', 'goog.string', 'goog.style'], false);
goog.addDependency('fx/draglistgroup_test.js', ['goog.fx.DragListGroupTest'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.Event', 'goog.events.EventType', 'goog.fx.DragEvent', 'goog.fx.DragListDirection', 'goog.fx.DragListGroup', 'goog.fx.Dragger', 'goog.math.Coordinate', 'goog.object', 'goog.testing.events', 'goog.testing.jsunit'], false);
goog.addDependency('fx/dragscrollsupport.js', ['goog.fx.DragScrollSupport'], ['goog.Disposable', 'goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.style'], false);
goog.addDependency('fx/dragscrollsupport_test.js', ['goog.fx.DragScrollSupportTest'], ['goog.fx.DragScrollSupport', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit'], false);
goog.addDependency('fx/easing.js', ['goog.fx.easing'], [], false);
goog.addDependency('fx/easing_test.js', ['goog.fx.easingTest'], ['goog.fx.easing', 'goog.testing.jsunit'], false);
goog.addDependency('fx/fx.js', ['goog.fx'], ['goog.asserts', 'goog.fx.Animation', 'goog.fx.Animation.EventType', 'goog.fx.Animation.State', 'goog.fx.AnimationEvent', 'goog.fx.Transition.EventType', 'goog.fx.easing'], false);
goog.addDependency('fx/fx_test.js', ['goog.fxTest'], ['goog.fx.Animation', 'goog.object', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('fx/transition.js', ['goog.fx.Transition', 'goog.fx.Transition.EventType'], [], false);
goog.addDependency('fx/transitionbase.js', ['goog.fx.TransitionBase', 'goog.fx.TransitionBase.State'], ['goog.events.EventTarget', 'goog.fx.Transition'], false);
goog.addDependency('graphics/abstractgraphics.js', ['goog.graphics.AbstractGraphics'], ['goog.dom', 'goog.graphics.Path', 'goog.math.Coordinate', 'goog.math.Size', 'goog.style', 'goog.ui.Component'], false);
goog.addDependency('graphics/affinetransform.js', ['goog.graphics.AffineTransform'], ['goog.math'], false);
goog.addDependency('graphics/canvaselement.js', ['goog.graphics.CanvasEllipseElement', 'goog.graphics.CanvasGroupElement', 'goog.graphics.CanvasImageElement', 'goog.graphics.CanvasPathElement', 'goog.graphics.CanvasRectElement', 'goog.graphics.CanvasTextElement'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.safe', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.Path', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement', 'goog.html.SafeHtml', 'goog.html.uncheckedconversions', 'goog.math', 'goog.string', 'goog.string.Const'], false);
goog.addDependency('graphics/canvasgraphics.js', ['goog.graphics.CanvasGraphics'], ['goog.dom.TagName', 'goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.CanvasEllipseElement', 'goog.graphics.CanvasGroupElement', 'goog.graphics.CanvasImageElement', 'goog.graphics.CanvasPathElement', 'goog.graphics.CanvasRectElement', 'goog.graphics.CanvasTextElement', 'goog.graphics.SolidFill', 'goog.math.Size', 'goog.style'], false);
goog.addDependency('graphics/canvasgraphics_test.js', ['goog.graphics.CanvasGraphicsTest'], ['goog.dom', 'goog.graphics.CanvasGraphics', 'goog.graphics.SolidFill', 'goog.graphics.Stroke', 'goog.testing.jsunit'], false);
goog.addDependency('graphics/element.js', ['goog.graphics.Element'], ['goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.events.Listenable', 'goog.graphics.AffineTransform', 'goog.math'], false);
goog.addDependency('graphics/ellipseelement.js', ['goog.graphics.EllipseElement'], ['goog.graphics.StrokeAndFillElement'], false);
goog.addDependency('graphics/ext/coordinates.js', ['goog.graphics.ext.coordinates'], ['goog.string'], false);
goog.addDependency('graphics/ext/element.js', ['goog.graphics.ext.Element'], ['goog.events.EventTarget', 'goog.functions', 'goog.graphics.ext.coordinates'], false);
goog.addDependency('graphics/ext/ellipse.js', ['goog.graphics.ext.Ellipse'], ['goog.graphics.ext.StrokeAndFillElement'], false);
goog.addDependency('graphics/ext/ext.js', ['goog.graphics.ext'], ['goog.graphics.ext.Ellipse', 'goog.graphics.ext.Graphics', 'goog.graphics.ext.Group', 'goog.graphics.ext.Image', 'goog.graphics.ext.Rectangle', 'goog.graphics.ext.Shape', 'goog.graphics.ext.coordinates'], false);
goog.addDependency('graphics/ext/graphics.js', ['goog.graphics.ext.Graphics'], ['goog.events', 'goog.events.EventType', 'goog.graphics', 'goog.graphics.ext.Group'], false);
goog.addDependency('graphics/ext/group.js', ['goog.graphics.ext.Group'], ['goog.array', 'goog.graphics.ext.Element'], false);
goog.addDependency('graphics/ext/image.js', ['goog.graphics.ext.Image'], ['goog.graphics.ext.Element'], false);
goog.addDependency('graphics/ext/path.js', ['goog.graphics.ext.Path'], ['goog.graphics.AffineTransform', 'goog.graphics.Path', 'goog.math.Rect'], false);
goog.addDependency('graphics/ext/rectangle.js', ['goog.graphics.ext.Rectangle'], ['goog.graphics.ext.StrokeAndFillElement'], false);
goog.addDependency('graphics/ext/shape.js', ['goog.graphics.ext.Shape'], ['goog.graphics.ext.StrokeAndFillElement'], false);
goog.addDependency('graphics/ext/strokeandfillelement.js', ['goog.graphics.ext.StrokeAndFillElement'], ['goog.graphics.ext.Element'], false);
goog.addDependency('graphics/fill.js', ['goog.graphics.Fill'], [], false);
goog.addDependency('graphics/font.js', ['goog.graphics.Font'], [], false);
goog.addDependency('graphics/graphics.js', ['goog.graphics'], ['goog.dom', 'goog.graphics.CanvasGraphics', 'goog.graphics.SvgGraphics', 'goog.graphics.VmlGraphics', 'goog.userAgent'], false);
goog.addDependency('graphics/groupelement.js', ['goog.graphics.GroupElement'], ['goog.graphics.Element'], false);
goog.addDependency('graphics/imageelement.js', ['goog.graphics.ImageElement'], ['goog.graphics.Element'], false);
goog.addDependency('graphics/lineargradient.js', ['goog.graphics.LinearGradient'], ['goog.asserts', 'goog.graphics.Fill'], false);
goog.addDependency('graphics/path.js', ['goog.graphics.Path', 'goog.graphics.Path.Segment'], ['goog.array', 'goog.math'], false);
goog.addDependency('graphics/pathelement.js', ['goog.graphics.PathElement'], ['goog.graphics.StrokeAndFillElement'], false);
goog.addDependency('graphics/paths.js', ['goog.graphics.paths'], ['goog.graphics.Path', 'goog.math.Coordinate'], false);
goog.addDependency('graphics/rectelement.js', ['goog.graphics.RectElement'], ['goog.graphics.StrokeAndFillElement'], false);
goog.addDependency('graphics/solidfill.js', ['goog.graphics.SolidFill'], ['goog.graphics.Fill'], false);
goog.addDependency('graphics/stroke.js', ['goog.graphics.Stroke'], [], false);
goog.addDependency('graphics/strokeandfillelement.js', ['goog.graphics.StrokeAndFillElement'], ['goog.graphics.Element'], false);
goog.addDependency('graphics/svgelement.js', ['goog.graphics.SvgEllipseElement', 'goog.graphics.SvgGroupElement', 'goog.graphics.SvgImageElement', 'goog.graphics.SvgPathElement', 'goog.graphics.SvgRectElement', 'goog.graphics.SvgTextElement'], ['goog.dom', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement'], false);
goog.addDependency('graphics/svggraphics.js', ['goog.graphics.SvgGraphics'], ['goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.LinearGradient', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.Stroke', 'goog.graphics.SvgEllipseElement', 'goog.graphics.SvgGroupElement', 'goog.graphics.SvgImageElement', 'goog.graphics.SvgPathElement', 'goog.graphics.SvgRectElement', 'goog.graphics.SvgTextElement', 'goog.math', 'goog.math.Size', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('graphics/textelement.js', ['goog.graphics.TextElement'], ['goog.graphics.StrokeAndFillElement'], false);
goog.addDependency('graphics/vmlelement.js', ['goog.graphics.VmlEllipseElement', 'goog.graphics.VmlGroupElement', 'goog.graphics.VmlImageElement', 'goog.graphics.VmlPathElement', 'goog.graphics.VmlRectElement', 'goog.graphics.VmlTextElement'], ['goog.dom', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement'], false);
goog.addDependency('graphics/vmlgraphics.js', ['goog.graphics.VmlGraphics'], ['goog.array', 'goog.dom.TagName', 'goog.dom.safe', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.LinearGradient', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.VmlEllipseElement', 'goog.graphics.VmlGroupElement', 'goog.graphics.VmlImageElement', 'goog.graphics.VmlPathElement', 'goog.graphics.VmlRectElement', 'goog.graphics.VmlTextElement', 'goog.html.uncheckedconversions', 'goog.math', 'goog.math.Size', 'goog.reflect', 'goog.string', 'goog.string.Const', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('history/event.js', ['goog.history.Event'], ['goog.events.Event', 'goog.history.EventType'], false);
goog.addDependency('history/eventtype.js', ['goog.history.EventType'], [], false);
goog.addDependency('history/history.js', ['goog.History', 'goog.History.Event', 'goog.History.EventType'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.InputType', 'goog.dom.safe', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.history.Event', 'goog.history.EventType', 'goog.html.SafeHtml', 'goog.html.TrustedResourceUrl', 'goog.html.legacyconversions', 'goog.labs.userAgent.device', 'goog.memoize', 'goog.string', 'goog.string.Const', 'goog.userAgent'], false);
goog.addDependency('history/history_test.js', ['goog.HistoryTest'], ['goog.History', 'goog.dispose', 'goog.dom', 'goog.html.TrustedResourceUrl', 'goog.string.Const', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('history/html5history.js', ['goog.history.Html5History', 'goog.history.Html5History.TokenTransformer'], ['goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.history.Event'], false);
goog.addDependency('history/html5history_test.js', ['goog.history.Html5HistoryTest'], ['goog.Timer', 'goog.events', 'goog.events.EventType', 'goog.history.EventType', 'goog.history.Html5History', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.testing.recordFunction'], false);
goog.addDependency('html/flash.js', ['goog.html.flash'], ['goog.asserts', 'goog.html.SafeHtml'], false);
goog.addDependency('html/flash_test.js', ['goog.html.flashTest'], ['goog.html.SafeHtml', 'goog.html.TrustedResourceUrl', 'goog.html.flash', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/legacyconversions.js', ['goog.html.legacyconversions'], ['goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl'], false);
goog.addDependency('html/legacyconversions_test.js', ['goog.html.legacyconversionsTest'], ['goog.html.SafeHtml', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.html.legacyconversions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('html/safehtml.js', ['goog.html.SafeHtml'], ['goog.array', 'goog.asserts', 'goog.dom.TagName', 'goog.dom.tags', 'goog.html.SafeStyle', 'goog.html.SafeStyleSheet', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.object', 'goog.string', 'goog.string.Const', 'goog.string.TypedString'], false);
goog.addDependency('html/safehtml_test.js', ['goog.html.safeHtmlTest'], ['goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.SafeStyleSheet', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.html.testing', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/safescript.js', ['goog.html.SafeScript'], ['goog.asserts', 'goog.string.Const', 'goog.string.TypedString'], false);
goog.addDependency('html/safescript_test.js', ['goog.html.safeScriptTest'], ['goog.html.SafeScript', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/safestyle.js', ['goog.html.SafeStyle'], ['goog.array', 'goog.asserts', 'goog.string', 'goog.string.Const', 'goog.string.TypedString'], false);
goog.addDependency('html/safestyle_test.js', ['goog.html.safeStyleTest'], ['goog.html.SafeStyle', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/safestylesheet.js', ['goog.html.SafeStyleSheet'], ['goog.array', 'goog.asserts', 'goog.string', 'goog.string.Const', 'goog.string.TypedString'], false);
goog.addDependency('html/safestylesheet_test.js', ['goog.html.safeStyleSheetTest'], ['goog.html.SafeStyleSheet', 'goog.string', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/safeurl.js', ['goog.html.SafeUrl'], ['goog.asserts', 'goog.fs.url', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.string.Const', 'goog.string.TypedString'], false);
goog.addDependency('html/safeurl_test.js', ['goog.html.safeUrlTest'], ['goog.html.SafeUrl', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('html/silverlight.js', ['goog.html.silverlight'], ['goog.html.SafeHtml', 'goog.html.TrustedResourceUrl', 'goog.html.flash', 'goog.string.Const'], false);
goog.addDependency('html/silverlight_test.js', ['goog.html.silverlightTest'], ['goog.html.SafeHtml', 'goog.html.TrustedResourceUrl', 'goog.html.silverlight', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/testing.js', ['goog.html.testing'], ['goog.html.SafeHtml', 'goog.html.SafeScript', 'goog.html.SafeStyle', 'goog.html.SafeStyleSheet', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl'], false);
goog.addDependency('html/trustedresourceurl.js', ['goog.html.TrustedResourceUrl'], ['goog.asserts', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.string.Const', 'goog.string.TypedString'], false);
goog.addDependency('html/trustedresourceurl_test.js', ['goog.html.trustedResourceUrlTest'], ['goog.html.TrustedResourceUrl', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/uncheckedconversions.js', ['goog.html.uncheckedconversions'], ['goog.asserts', 'goog.html.SafeHtml', 'goog.html.SafeScript', 'goog.html.SafeStyle', 'goog.html.SafeStyleSheet', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.string', 'goog.string.Const'], false);
goog.addDependency('html/uncheckedconversions_test.js', ['goog.html.uncheckedconversionsTest'], ['goog.html.SafeHtml', 'goog.html.SafeScript', 'goog.html.SafeStyle', 'goog.html.SafeStyleSheet', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.html.uncheckedconversions', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('html/utils.js', ['goog.html.utils'], ['goog.string'], false);
goog.addDependency('html/utils_test.js', ['goog.html.UtilsTest'], ['goog.array', 'goog.dom.TagName', 'goog.html.utils', 'goog.object', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/bidi.js', ['goog.i18n.bidi', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.i18n.bidi.Format'], [], false);
goog.addDependency('i18n/bidi_test.js', ['goog.i18n.bidiTest'], ['goog.i18n.bidi', 'goog.i18n.bidi.Dir', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/bidiformatter.js', ['goog.i18n.BidiFormatter'], ['goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.i18n.bidi', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.Format'], false);
goog.addDependency('i18n/bidiformatter_test.js', ['goog.i18n.BidiFormatterTest'], ['goog.html.SafeHtml', 'goog.i18n.BidiFormatter', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.Format', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/charlistdecompressor.js', ['goog.i18n.CharListDecompressor'], ['goog.array', 'goog.i18n.uChar'], false);
goog.addDependency('i18n/charlistdecompressor_test.js', ['goog.i18n.CharListDecompressorTest'], ['goog.i18n.CharListDecompressor', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/charpickerdata.js', ['goog.i18n.CharPickerData'], [], false);
goog.addDependency('i18n/collation.js', ['goog.i18n.collation'], [], false);
goog.addDependency('i18n/collation_test.js', ['goog.i18n.collationTest'], ['goog.i18n.collation', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('i18n/compactnumberformatsymbols.js', ['goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.CompactNumberFormatSymbols_af', 'goog.i18n.CompactNumberFormatSymbols_af_ZA', 'goog.i18n.CompactNumberFormatSymbols_am', 'goog.i18n.CompactNumberFormatSymbols_am_ET', 'goog.i18n.CompactNumberFormatSymbols_ar', 'goog.i18n.CompactNumberFormatSymbols_ar_001', 'goog.i18n.CompactNumberFormatSymbols_ar_EG', 'goog.i18n.CompactNumberFormatSymbols_az', 'goog.i18n.CompactNumberFormatSymbols_az_Latn', 'goog.i18n.CompactNumberFormatSymbols_az_Latn_AZ', 'goog.i18n.CompactNumberFormatSymbols_be', 'goog.i18n.CompactNumberFormatSymbols_be_BY', 'goog.i18n.CompactNumberFormatSymbols_bg', 'goog.i18n.CompactNumberFormatSymbols_bg_BG', 'goog.i18n.CompactNumberFormatSymbols_bn', 'goog.i18n.CompactNumberFormatSymbols_bn_BD', 'goog.i18n.CompactNumberFormatSymbols_br', 'goog.i18n.CompactNumberFormatSymbols_br_FR', 'goog.i18n.CompactNumberFormatSymbols_bs', 'goog.i18n.CompactNumberFormatSymbols_bs_Latn', 'goog.i18n.CompactNumberFormatSymbols_bs_Latn_BA', 'goog.i18n.CompactNumberFormatSymbols_ca', 'goog.i18n.CompactNumberFormatSymbols_ca_AD', 'goog.i18n.CompactNumberFormatSymbols_ca_ES', 'goog.i18n.CompactNumberFormatSymbols_ca_ES_VALENCIA', 'goog.i18n.CompactNumberFormatSymbols_ca_FR', 'goog.i18n.CompactNumberFormatSymbols_ca_IT', 'goog.i18n.CompactNumberFormatSymbols_chr', 'goog.i18n.CompactNumberFormatSymbols_chr_US', 'goog.i18n.CompactNumberFormatSymbols_cs', 'goog.i18n.CompactNumberFormatSymbols_cs_CZ', 'goog.i18n.CompactNumberFormatSymbols_cy', 'goog.i18n.CompactNumberFormatSymbols_cy_GB', 'goog.i18n.CompactNumberFormatSymbols_da', 'goog.i18n.CompactNumberFormatSymbols_da_DK', 'goog.i18n.CompactNumberFormatSymbols_da_GL', 'goog.i18n.CompactNumberFormatSymbols_de', 'goog.i18n.CompactNumberFormatSymbols_de_AT', 'goog.i18n.CompactNumberFormatSymbols_de_BE', 'goog.i18n.CompactNumberFormatSymbols_de_CH', 'goog.i18n.CompactNumberFormatSymbols_de_DE', 'goog.i18n.CompactNumberFormatSymbols_de_LU', 'goog.i18n.CompactNumberFormatSymbols_el', 'goog.i18n.CompactNumberFormatSymbols_el_CY', 'goog.i18n.CompactNumberFormatSymbols_el_GR', 'goog.i18n.CompactNumberFormatSymbols_en', 'goog.i18n.CompactNumberFormatSymbols_en_001', 'goog.i18n.CompactNumberFormatSymbols_en_AS', 'goog.i18n.CompactNumberFormatSymbols_en_AU', 'goog.i18n.CompactNumberFormatSymbols_en_CA', 'goog.i18n.CompactNumberFormatSymbols_en_DG', 'goog.i18n.CompactNumberFormatSymbols_en_FM', 'goog.i18n.CompactNumberFormatSymbols_en_GB', 'goog.i18n.CompactNumberFormatSymbols_en_GU', 'goog.i18n.CompactNumberFormatSymbols_en_IE', 'goog.i18n.CompactNumberFormatSymbols_en_IN', 'goog.i18n.CompactNumberFormatSymbols_en_IO', 'goog.i18n.CompactNumberFormatSymbols_en_MH', 'goog.i18n.CompactNumberFormatSymbols_en_MP', 'goog.i18n.CompactNumberFormatSymbols_en_PR', 'goog.i18n.CompactNumberFormatSymbols_en_PW', 'goog.i18n.CompactNumberFormatSymbols_en_SG', 'goog.i18n.CompactNumberFormatSymbols_en_TC', 'goog.i18n.CompactNumberFormatSymbols_en_UM', 'goog.i18n.CompactNumberFormatSymbols_en_US', 'goog.i18n.CompactNumberFormatSymbols_en_VG', 'goog.i18n.CompactNumberFormatSymbols_en_VI', 'goog.i18n.CompactNumberFormatSymbols_en_ZA', 'goog.i18n.CompactNumberFormatSymbols_en_ZW', 'goog.i18n.CompactNumberFormatSymbols_es', 'goog.i18n.CompactNumberFormatSymbols_es_419', 'goog.i18n.CompactNumberFormatSymbols_es_EA', 'goog.i18n.CompactNumberFormatSymbols_es_ES', 'goog.i18n.CompactNumberFormatSymbols_es_IC', 'goog.i18n.CompactNumberFormatSymbols_es_MX', 'goog.i18n.CompactNumberFormatSymbols_es_US', 'goog.i18n.CompactNumberFormatSymbols_et', 'goog.i18n.CompactNumberFormatSymbols_et_EE', 'goog.i18n.CompactNumberFormatSymbols_eu', 'goog.i18n.CompactNumberFormatSymbols_eu_ES', 'goog.i18n.CompactNumberFormatSymbols_fa', 'goog.i18n.CompactNumberFormatSymbols_fa_IR', 'goog.i18n.CompactNumberFormatSymbols_fi', 'goog.i18n.CompactNumberFormatSymbols_fi_FI', 'goog.i18n.CompactNumberFormatSymbols_fil', 'goog.i18n.CompactNumberFormatSymbols_fil_PH', 'goog.i18n.CompactNumberFormatSymbols_fr', 'goog.i18n.CompactNumberFormatSymbols_fr_BL', 'goog.i18n.CompactNumberFormatSymbols_fr_CA', 'goog.i18n.CompactNumberFormatSymbols_fr_FR', 'goog.i18n.CompactNumberFormatSymbols_fr_GF', 'goog.i18n.CompactNumberFormatSymbols_fr_GP', 'goog.i18n.CompactNumberFormatSymbols_fr_MC', 'goog.i18n.CompactNumberFormatSymbols_fr_MF', 'goog.i18n.CompactNumberFormatSymbols_fr_MQ', 'goog.i18n.CompactNumberFormatSymbols_fr_PM', 'goog.i18n.CompactNumberFormatSymbols_fr_RE', 'goog.i18n.CompactNumberFormatSymbols_fr_YT', 'goog.i18n.CompactNumberFormatSymbols_ga', 'goog.i18n.CompactNumberFormatSymbols_ga_IE', 'goog.i18n.CompactNumberFormatSymbols_gl', 'goog.i18n.CompactNumberFormatSymbols_gl_ES', 'goog.i18n.CompactNumberFormatSymbols_gsw', 'goog.i18n.CompactNumberFormatSymbols_gsw_CH', 'goog.i18n.CompactNumberFormatSymbols_gsw_LI', 'goog.i18n.CompactNumberFormatSymbols_gu', 'goog.i18n.CompactNumberFormatSymbols_gu_IN', 'goog.i18n.CompactNumberFormatSymbols_haw', 'goog.i18n.CompactNumberFormatSymbols_haw_US', 'goog.i18n.CompactNumberFormatSymbols_he', 'goog.i18n.CompactNumberFormatSymbols_he_IL', 'goog.i18n.CompactNumberFormatSymbols_hi', 'goog.i18n.CompactNumberFormatSymbols_hi_IN', 'goog.i18n.CompactNumberFormatSymbols_hr', 'goog.i18n.CompactNumberFormatSymbols_hr_HR', 'goog.i18n.CompactNumberFormatSymbols_hu', 'goog.i18n.CompactNumberFormatSymbols_hu_HU', 'goog.i18n.CompactNumberFormatSymbols_hy', 'goog.i18n.CompactNumberFormatSymbols_hy_AM', 'goog.i18n.CompactNumberFormatSymbols_id', 'goog.i18n.CompactNumberFormatSymbols_id_ID', 'goog.i18n.CompactNumberFormatSymbols_in', 'goog.i18n.CompactNumberFormatSymbols_is', 'goog.i18n.CompactNumberFormatSymbols_is_IS', 'goog.i18n.CompactNumberFormatSymbols_it', 'goog.i18n.CompactNumberFormatSymbols_it_IT', 'goog.i18n.CompactNumberFormatSymbols_it_SM', 'goog.i18n.CompactNumberFormatSymbols_iw', 'goog.i18n.CompactNumberFormatSymbols_ja', 'goog.i18n.CompactNumberFormatSymbols_ja_JP', 'goog.i18n.CompactNumberFormatSymbols_ka', 'goog.i18n.CompactNumberFormatSymbols_ka_GE', 'goog.i18n.CompactNumberFormatSymbols_kk', 'goog.i18n.CompactNumberFormatSymbols_kk_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_kk_Cyrl_KZ', 'goog.i18n.CompactNumberFormatSymbols_km', 'goog.i18n.CompactNumberFormatSymbols_km_KH', 'goog.i18n.CompactNumberFormatSymbols_kn', 'goog.i18n.CompactNumberFormatSymbols_kn_IN', 'goog.i18n.CompactNumberFormatSymbols_ko', 'goog.i18n.CompactNumberFormatSymbols_ko_KR', 'goog.i18n.CompactNumberFormatSymbols_ky', 'goog.i18n.CompactNumberFormatSymbols_ky_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_ky_Cyrl_KG', 'goog.i18n.CompactNumberFormatSymbols_ln', 'goog.i18n.CompactNumberFormatSymbols_ln_CD', 'goog.i18n.CompactNumberFormatSymbols_lo', 'goog.i18n.CompactNumberFormatSymbols_lo_LA', 'goog.i18n.CompactNumberFormatSymbols_lt', 'goog.i18n.CompactNumberFormatSymbols_lt_LT', 'goog.i18n.CompactNumberFormatSymbols_lv', 'goog.i18n.CompactNumberFormatSymbols_lv_LV', 'goog.i18n.CompactNumberFormatSymbols_mk', 'goog.i18n.CompactNumberFormatSymbols_mk_MK', 'goog.i18n.CompactNumberFormatSymbols_ml', 'goog.i18n.CompactNumberFormatSymbols_ml_IN', 'goog.i18n.CompactNumberFormatSymbols_mn', 'goog.i18n.CompactNumberFormatSymbols_mn_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_mn_Cyrl_MN', 'goog.i18n.CompactNumberFormatSymbols_mr', 'goog.i18n.CompactNumberFormatSymbols_mr_IN', 'goog.i18n.CompactNumberFormatSymbols_ms', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_MY', 'goog.i18n.CompactNumberFormatSymbols_mt', 'goog.i18n.CompactNumberFormatSymbols_mt_MT', 'goog.i18n.CompactNumberFormatSymbols_my', 'goog.i18n.CompactNumberFormatSymbols_my_MM', 'goog.i18n.CompactNumberFormatSymbols_nb', 'goog.i18n.CompactNumberFormatSymbols_nb_NO', 'goog.i18n.CompactNumberFormatSymbols_nb_SJ', 'goog.i18n.CompactNumberFormatSymbols_ne', 'goog.i18n.CompactNumberFormatSymbols_ne_NP', 'goog.i18n.CompactNumberFormatSymbols_nl', 'goog.i18n.CompactNumberFormatSymbols_nl_NL', 'goog.i18n.CompactNumberFormatSymbols_no', 'goog.i18n.CompactNumberFormatSymbols_no_NO', 'goog.i18n.CompactNumberFormatSymbols_or', 'goog.i18n.CompactNumberFormatSymbols_or_IN', 'goog.i18n.CompactNumberFormatSymbols_pa', 'goog.i18n.CompactNumberFormatSymbols_pa_Guru', 'goog.i18n.CompactNumberFormatSymbols_pa_Guru_IN', 'goog.i18n.CompactNumberFormatSymbols_pl', 'goog.i18n.CompactNumberFormatSymbols_pl_PL', 'goog.i18n.CompactNumberFormatSymbols_pt', 'goog.i18n.CompactNumberFormatSymbols_pt_BR', 'goog.i18n.CompactNumberFormatSymbols_pt_PT', 'goog.i18n.CompactNumberFormatSymbols_ro', 'goog.i18n.CompactNumberFormatSymbols_ro_RO', 'goog.i18n.CompactNumberFormatSymbols_ru', 'goog.i18n.CompactNumberFormatSymbols_ru_RU', 'goog.i18n.CompactNumberFormatSymbols_si', 'goog.i18n.CompactNumberFormatSymbols_si_LK', 'goog.i18n.CompactNumberFormatSymbols_sk', 'goog.i18n.CompactNumberFormatSymbols_sk_SK', 'goog.i18n.CompactNumberFormatSymbols_sl', 'goog.i18n.CompactNumberFormatSymbols_sl_SI', 'goog.i18n.CompactNumberFormatSymbols_sq', 'goog.i18n.CompactNumberFormatSymbols_sq_AL', 'goog.i18n.CompactNumberFormatSymbols_sr', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_RS', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_RS', 'goog.i18n.CompactNumberFormatSymbols_sv', 'goog.i18n.CompactNumberFormatSymbols_sv_SE', 'goog.i18n.CompactNumberFormatSymbols_sw', 'goog.i18n.CompactNumberFormatSymbols_sw_TZ', 'goog.i18n.CompactNumberFormatSymbols_ta', 'goog.i18n.CompactNumberFormatSymbols_ta_IN', 'goog.i18n.CompactNumberFormatSymbols_te', 'goog.i18n.CompactNumberFormatSymbols_te_IN', 'goog.i18n.CompactNumberFormatSymbols_th', 'goog.i18n.CompactNumberFormatSymbols_th_TH', 'goog.i18n.CompactNumberFormatSymbols_tl', 'goog.i18n.CompactNumberFormatSymbols_tr', 'goog.i18n.CompactNumberFormatSymbols_tr_TR', 'goog.i18n.CompactNumberFormatSymbols_uk', 'goog.i18n.CompactNumberFormatSymbols_uk_UA', 'goog.i18n.CompactNumberFormatSymbols_ur', 'goog.i18n.CompactNumberFormatSymbols_ur_PK', 'goog.i18n.CompactNumberFormatSymbols_uz', 'goog.i18n.CompactNumberFormatSymbols_uz_Latn', 'goog.i18n.CompactNumberFormatSymbols_uz_Latn_UZ', 'goog.i18n.CompactNumberFormatSymbols_vi', 'goog.i18n.CompactNumberFormatSymbols_vi_VN', 'goog.i18n.CompactNumberFormatSymbols_zh', 'goog.i18n.CompactNumberFormatSymbols_zh_CN', 'goog.i18n.CompactNumberFormatSymbols_zh_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_CN', 'goog.i18n.CompactNumberFormatSymbols_zh_TW', 'goog.i18n.CompactNumberFormatSymbols_zu', 'goog.i18n.CompactNumberFormatSymbols_zu_ZA'], [], false);
goog.addDependency('i18n/compactnumberformatsymbols_ext.js', ['goog.i18n.CompactNumberFormatSymbolsExt', 'goog.i18n.CompactNumberFormatSymbols_af_NA', 'goog.i18n.CompactNumberFormatSymbols_agq', 'goog.i18n.CompactNumberFormatSymbols_agq_CM', 'goog.i18n.CompactNumberFormatSymbols_ak', 'goog.i18n.CompactNumberFormatSymbols_ak_GH', 'goog.i18n.CompactNumberFormatSymbols_ar_AE', 'goog.i18n.CompactNumberFormatSymbols_ar_BH', 'goog.i18n.CompactNumberFormatSymbols_ar_DJ', 'goog.i18n.CompactNumberFormatSymbols_ar_DZ', 'goog.i18n.CompactNumberFormatSymbols_ar_EH', 'goog.i18n.CompactNumberFormatSymbols_ar_ER', 'goog.i18n.CompactNumberFormatSymbols_ar_IL', 'goog.i18n.CompactNumberFormatSymbols_ar_IQ', 'goog.i18n.CompactNumberFormatSymbols_ar_JO', 'goog.i18n.CompactNumberFormatSymbols_ar_KM', 'goog.i18n.CompactNumberFormatSymbols_ar_KW', 'goog.i18n.CompactNumberFormatSymbols_ar_LB', 'goog.i18n.CompactNumberFormatSymbols_ar_LY', 'goog.i18n.CompactNumberFormatSymbols_ar_MA', 'goog.i18n.CompactNumberFormatSymbols_ar_MR', 'goog.i18n.CompactNumberFormatSymbols_ar_OM', 'goog.i18n.CompactNumberFormatSymbols_ar_PS', 'goog.i18n.CompactNumberFormatSymbols_ar_QA', 'goog.i18n.CompactNumberFormatSymbols_ar_SA', 'goog.i18n.CompactNumberFormatSymbols_ar_SD', 'goog.i18n.CompactNumberFormatSymbols_ar_SO', 'goog.i18n.CompactNumberFormatSymbols_ar_SS', 'goog.i18n.CompactNumberFormatSymbols_ar_SY', 'goog.i18n.CompactNumberFormatSymbols_ar_TD', 'goog.i18n.CompactNumberFormatSymbols_ar_TN', 'goog.i18n.CompactNumberFormatSymbols_ar_YE', 'goog.i18n.CompactNumberFormatSymbols_as', 'goog.i18n.CompactNumberFormatSymbols_as_IN', 'goog.i18n.CompactNumberFormatSymbols_asa', 'goog.i18n.CompactNumberFormatSymbols_asa_TZ', 'goog.i18n.CompactNumberFormatSymbols_ast', 'goog.i18n.CompactNumberFormatSymbols_ast_ES', 'goog.i18n.CompactNumberFormatSymbols_az_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_az_Cyrl_AZ', 'goog.i18n.CompactNumberFormatSymbols_bas', 'goog.i18n.CompactNumberFormatSymbols_bas_CM', 'goog.i18n.CompactNumberFormatSymbols_bem', 'goog.i18n.CompactNumberFormatSymbols_bem_ZM', 'goog.i18n.CompactNumberFormatSymbols_bez', 'goog.i18n.CompactNumberFormatSymbols_bez_TZ', 'goog.i18n.CompactNumberFormatSymbols_bm', 'goog.i18n.CompactNumberFormatSymbols_bm_Latn', 'goog.i18n.CompactNumberFormatSymbols_bm_Latn_ML', 'goog.i18n.CompactNumberFormatSymbols_bn_IN', 'goog.i18n.CompactNumberFormatSymbols_bo', 'goog.i18n.CompactNumberFormatSymbols_bo_CN', 'goog.i18n.CompactNumberFormatSymbols_bo_IN', 'goog.i18n.CompactNumberFormatSymbols_brx', 'goog.i18n.CompactNumberFormatSymbols_brx_IN', 'goog.i18n.CompactNumberFormatSymbols_bs_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_bs_Cyrl_BA', 'goog.i18n.CompactNumberFormatSymbols_cgg', 'goog.i18n.CompactNumberFormatSymbols_cgg_UG', 'goog.i18n.CompactNumberFormatSymbols_ckb', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IQ', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IR', 'goog.i18n.CompactNumberFormatSymbols_ckb_IQ', 'goog.i18n.CompactNumberFormatSymbols_ckb_IR', 'goog.i18n.CompactNumberFormatSymbols_ckb_Latn', 'goog.i18n.CompactNumberFormatSymbols_ckb_Latn_IQ', 'goog.i18n.CompactNumberFormatSymbols_dav', 'goog.i18n.CompactNumberFormatSymbols_dav_KE', 'goog.i18n.CompactNumberFormatSymbols_de_LI', 'goog.i18n.CompactNumberFormatSymbols_dje', 'goog.i18n.CompactNumberFormatSymbols_dje_NE', 'goog.i18n.CompactNumberFormatSymbols_dsb', 'goog.i18n.CompactNumberFormatSymbols_dsb_DE', 'goog.i18n.CompactNumberFormatSymbols_dua', 'goog.i18n.CompactNumberFormatSymbols_dua_CM', 'goog.i18n.CompactNumberFormatSymbols_dyo', 'goog.i18n.CompactNumberFormatSymbols_dyo_SN', 'goog.i18n.CompactNumberFormatSymbols_dz', 'goog.i18n.CompactNumberFormatSymbols_dz_BT', 'goog.i18n.CompactNumberFormatSymbols_ebu', 'goog.i18n.CompactNumberFormatSymbols_ebu_KE', 'goog.i18n.CompactNumberFormatSymbols_ee', 'goog.i18n.CompactNumberFormatSymbols_ee_GH', 'goog.i18n.CompactNumberFormatSymbols_ee_TG', 'goog.i18n.CompactNumberFormatSymbols_en_150', 'goog.i18n.CompactNumberFormatSymbols_en_AG', 'goog.i18n.CompactNumberFormatSymbols_en_AI', 'goog.i18n.CompactNumberFormatSymbols_en_BB', 'goog.i18n.CompactNumberFormatSymbols_en_BE', 'goog.i18n.CompactNumberFormatSymbols_en_BM', 'goog.i18n.CompactNumberFormatSymbols_en_BS', 'goog.i18n.CompactNumberFormatSymbols_en_BW', 'goog.i18n.CompactNumberFormatSymbols_en_BZ', 'goog.i18n.CompactNumberFormatSymbols_en_CC', 'goog.i18n.CompactNumberFormatSymbols_en_CK', 'goog.i18n.CompactNumberFormatSymbols_en_CM', 'goog.i18n.CompactNumberFormatSymbols_en_CX', 'goog.i18n.CompactNumberFormatSymbols_en_DM', 'goog.i18n.CompactNumberFormatSymbols_en_ER', 'goog.i18n.CompactNumberFormatSymbols_en_FJ', 'goog.i18n.CompactNumberFormatSymbols_en_FK', 'goog.i18n.CompactNumberFormatSymbols_en_GD', 'goog.i18n.CompactNumberFormatSymbols_en_GG', 'goog.i18n.CompactNumberFormatSymbols_en_GH', 'goog.i18n.CompactNumberFormatSymbols_en_GI', 'goog.i18n.CompactNumberFormatSymbols_en_GM', 'goog.i18n.CompactNumberFormatSymbols_en_GY', 'goog.i18n.CompactNumberFormatSymbols_en_HK', 'goog.i18n.CompactNumberFormatSymbols_en_IM', 'goog.i18n.CompactNumberFormatSymbols_en_JE', 'goog.i18n.CompactNumberFormatSymbols_en_JM', 'goog.i18n.CompactNumberFormatSymbols_en_KE', 'goog.i18n.CompactNumberFormatSymbols_en_KI', 'goog.i18n.CompactNumberFormatSymbols_en_KN', 'goog.i18n.CompactNumberFormatSymbols_en_KY', 'goog.i18n.CompactNumberFormatSymbols_en_LC', 'goog.i18n.CompactNumberFormatSymbols_en_LR', 'goog.i18n.CompactNumberFormatSymbols_en_LS', 'goog.i18n.CompactNumberFormatSymbols_en_MG', 'goog.i18n.CompactNumberFormatSymbols_en_MO', 'goog.i18n.CompactNumberFormatSymbols_en_MS', 'goog.i18n.CompactNumberFormatSymbols_en_MT', 'goog.i18n.CompactNumberFormatSymbols_en_MU', 'goog.i18n.CompactNumberFormatSymbols_en_MW', 'goog.i18n.CompactNumberFormatSymbols_en_MY', 'goog.i18n.CompactNumberFormatSymbols_en_NA', 'goog.i18n.CompactNumberFormatSymbols_en_NF', 'goog.i18n.CompactNumberFormatSymbols_en_NG', 'goog.i18n.CompactNumberFormatSymbols_en_NR', 'goog.i18n.CompactNumberFormatSymbols_en_NU', 'goog.i18n.CompactNumberFormatSymbols_en_NZ', 'goog.i18n.CompactNumberFormatSymbols_en_PG', 'goog.i18n.CompactNumberFormatSymbols_en_PH', 'goog.i18n.CompactNumberFormatSymbols_en_PK', 'goog.i18n.CompactNumberFormatSymbols_en_PN', 'goog.i18n.CompactNumberFormatSymbols_en_RW', 'goog.i18n.CompactNumberFormatSymbols_en_SB', 'goog.i18n.CompactNumberFormatSymbols_en_SC', 'goog.i18n.CompactNumberFormatSymbols_en_SD', 'goog.i18n.CompactNumberFormatSymbols_en_SH', 'goog.i18n.CompactNumberFormatSymbols_en_SL', 'goog.i18n.CompactNumberFormatSymbols_en_SS', 'goog.i18n.CompactNumberFormatSymbols_en_SX', 'goog.i18n.CompactNumberFormatSymbols_en_SZ', 'goog.i18n.CompactNumberFormatSymbols_en_TK', 'goog.i18n.CompactNumberFormatSymbols_en_TO', 'goog.i18n.CompactNumberFormatSymbols_en_TT', 'goog.i18n.CompactNumberFormatSymbols_en_TV', 'goog.i18n.CompactNumberFormatSymbols_en_TZ', 'goog.i18n.CompactNumberFormatSymbols_en_UG', 'goog.i18n.CompactNumberFormatSymbols_en_VC', 'goog.i18n.CompactNumberFormatSymbols_en_VU', 'goog.i18n.CompactNumberFormatSymbols_en_WS', 'goog.i18n.CompactNumberFormatSymbols_en_ZM', 'goog.i18n.CompactNumberFormatSymbols_eo', 'goog.i18n.CompactNumberFormatSymbols_eo_001', 'goog.i18n.CompactNumberFormatSymbols_es_AR', 'goog.i18n.CompactNumberFormatSymbols_es_BO', 'goog.i18n.CompactNumberFormatSymbols_es_CL', 'goog.i18n.CompactNumberFormatSymbols_es_CO', 'goog.i18n.CompactNumberFormatSymbols_es_CR', 'goog.i18n.CompactNumberFormatSymbols_es_CU', 'goog.i18n.CompactNumberFormatSymbols_es_DO', 'goog.i18n.CompactNumberFormatSymbols_es_EC', 'goog.i18n.CompactNumberFormatSymbols_es_GQ', 'goog.i18n.CompactNumberFormatSymbols_es_GT', 'goog.i18n.CompactNumberFormatSymbols_es_HN', 'goog.i18n.CompactNumberFormatSymbols_es_NI', 'goog.i18n.CompactNumberFormatSymbols_es_PA', 'goog.i18n.CompactNumberFormatSymbols_es_PE', 'goog.i18n.CompactNumberFormatSymbols_es_PH', 'goog.i18n.CompactNumberFormatSymbols_es_PR', 'goog.i18n.CompactNumberFormatSymbols_es_PY', 'goog.i18n.CompactNumberFormatSymbols_es_SV', 'goog.i18n.CompactNumberFormatSymbols_es_UY', 'goog.i18n.CompactNumberFormatSymbols_es_VE', 'goog.i18n.CompactNumberFormatSymbols_ewo', 'goog.i18n.CompactNumberFormatSymbols_ewo_CM', 'goog.i18n.CompactNumberFormatSymbols_fa_AF', 'goog.i18n.CompactNumberFormatSymbols_ff', 'goog.i18n.CompactNumberFormatSymbols_ff_CM', 'goog.i18n.CompactNumberFormatSymbols_ff_GN', 'goog.i18n.CompactNumberFormatSymbols_ff_MR', 'goog.i18n.CompactNumberFormatSymbols_ff_SN', 'goog.i18n.CompactNumberFormatSymbols_fo', 'goog.i18n.CompactNumberFormatSymbols_fo_FO', 'goog.i18n.CompactNumberFormatSymbols_fr_BE', 'goog.i18n.CompactNumberFormatSymbols_fr_BF', 'goog.i18n.CompactNumberFormatSymbols_fr_BI', 'goog.i18n.CompactNumberFormatSymbols_fr_BJ', 'goog.i18n.CompactNumberFormatSymbols_fr_CD', 'goog.i18n.CompactNumberFormatSymbols_fr_CF', 'goog.i18n.CompactNumberFormatSymbols_fr_CG', 'goog.i18n.CompactNumberFormatSymbols_fr_CH', 'goog.i18n.CompactNumberFormatSymbols_fr_CI', 'goog.i18n.CompactNumberFormatSymbols_fr_CM', 'goog.i18n.CompactNumberFormatSymbols_fr_DJ', 'goog.i18n.CompactNumberFormatSymbols_fr_DZ', 'goog.i18n.CompactNumberFormatSymbols_fr_GA', 'goog.i18n.CompactNumberFormatSymbols_fr_GN', 'goog.i18n.CompactNumberFormatSymbols_fr_GQ', 'goog.i18n.CompactNumberFormatSymbols_fr_HT', 'goog.i18n.CompactNumberFormatSymbols_fr_KM', 'goog.i18n.CompactNumberFormatSymbols_fr_LU', 'goog.i18n.CompactNumberFormatSymbols_fr_MA', 'goog.i18n.CompactNumberFormatSymbols_fr_MG', 'goog.i18n.CompactNumberFormatSymbols_fr_ML', 'goog.i18n.CompactNumberFormatSymbols_fr_MR', 'goog.i18n.CompactNumberFormatSymbols_fr_MU', 'goog.i18n.CompactNumberFormatSymbols_fr_NC', 'goog.i18n.CompactNumberFormatSymbols_fr_NE', 'goog.i18n.CompactNumberFormatSymbols_fr_PF', 'goog.i18n.CompactNumberFormatSymbols_fr_RW', 'goog.i18n.CompactNumberFormatSymbols_fr_SC', 'goog.i18n.CompactNumberFormatSymbols_fr_SN', 'goog.i18n.CompactNumberFormatSymbols_fr_SY', 'goog.i18n.CompactNumberFormatSymbols_fr_TD', 'goog.i18n.CompactNumberFormatSymbols_fr_TG', 'goog.i18n.CompactNumberFormatSymbols_fr_TN', 'goog.i18n.CompactNumberFormatSymbols_fr_VU', 'goog.i18n.CompactNumberFormatSymbols_fr_WF', 'goog.i18n.CompactNumberFormatSymbols_fur', 'goog.i18n.CompactNumberFormatSymbols_fur_IT', 'goog.i18n.CompactNumberFormatSymbols_fy', 'goog.i18n.CompactNumberFormatSymbols_fy_NL', 'goog.i18n.CompactNumberFormatSymbols_gd', 'goog.i18n.CompactNumberFormatSymbols_gd_GB', 'goog.i18n.CompactNumberFormatSymbols_gsw_FR', 'goog.i18n.CompactNumberFormatSymbols_guz', 'goog.i18n.CompactNumberFormatSymbols_guz_KE', 'goog.i18n.CompactNumberFormatSymbols_gv', 'goog.i18n.CompactNumberFormatSymbols_gv_IM', 'goog.i18n.CompactNumberFormatSymbols_ha', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_GH', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_NE', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_NG', 'goog.i18n.CompactNumberFormatSymbols_hr_BA', 'goog.i18n.CompactNumberFormatSymbols_hsb', 'goog.i18n.CompactNumberFormatSymbols_hsb_DE', 'goog.i18n.CompactNumberFormatSymbols_ig', 'goog.i18n.CompactNumberFormatSymbols_ig_NG', 'goog.i18n.CompactNumberFormatSymbols_ii', 'goog.i18n.CompactNumberFormatSymbols_ii_CN', 'goog.i18n.CompactNumberFormatSymbols_it_CH', 'goog.i18n.CompactNumberFormatSymbols_jgo', 'goog.i18n.CompactNumberFormatSymbols_jgo_CM', 'goog.i18n.CompactNumberFormatSymbols_jmc', 'goog.i18n.CompactNumberFormatSymbols_jmc_TZ', 'goog.i18n.CompactNumberFormatSymbols_kab', 'goog.i18n.CompactNumberFormatSymbols_kab_DZ', 'goog.i18n.CompactNumberFormatSymbols_kam', 'goog.i18n.CompactNumberFormatSymbols_kam_KE', 'goog.i18n.CompactNumberFormatSymbols_kde', 'goog.i18n.CompactNumberFormatSymbols_kde_TZ', 'goog.i18n.CompactNumberFormatSymbols_kea', 'goog.i18n.CompactNumberFormatSymbols_kea_CV', 'goog.i18n.CompactNumberFormatSymbols_khq', 'goog.i18n.CompactNumberFormatSymbols_khq_ML', 'goog.i18n.CompactNumberFormatSymbols_ki', 'goog.i18n.CompactNumberFormatSymbols_ki_KE', 'goog.i18n.CompactNumberFormatSymbols_kkj', 'goog.i18n.CompactNumberFormatSymbols_kkj_CM', 'goog.i18n.CompactNumberFormatSymbols_kl', 'goog.i18n.CompactNumberFormatSymbols_kl_GL', 'goog.i18n.CompactNumberFormatSymbols_kln', 'goog.i18n.CompactNumberFormatSymbols_kln_KE', 'goog.i18n.CompactNumberFormatSymbols_ko_KP', 'goog.i18n.CompactNumberFormatSymbols_kok', 'goog.i18n.CompactNumberFormatSymbols_kok_IN', 'goog.i18n.CompactNumberFormatSymbols_ks', 'goog.i18n.CompactNumberFormatSymbols_ks_Arab', 'goog.i18n.CompactNumberFormatSymbols_ks_Arab_IN', 'goog.i18n.CompactNumberFormatSymbols_ksb', 'goog.i18n.CompactNumberFormatSymbols_ksb_TZ', 'goog.i18n.CompactNumberFormatSymbols_ksf', 'goog.i18n.CompactNumberFormatSymbols_ksf_CM', 'goog.i18n.CompactNumberFormatSymbols_ksh', 'goog.i18n.CompactNumberFormatSymbols_ksh_DE', 'goog.i18n.CompactNumberFormatSymbols_kw', 'goog.i18n.CompactNumberFormatSymbols_kw_GB', 'goog.i18n.CompactNumberFormatSymbols_lag', 'goog.i18n.CompactNumberFormatSymbols_lag_TZ', 'goog.i18n.CompactNumberFormatSymbols_lb', 'goog.i18n.CompactNumberFormatSymbols_lb_LU', 'goog.i18n.CompactNumberFormatSymbols_lg', 'goog.i18n.CompactNumberFormatSymbols_lg_UG', 'goog.i18n.CompactNumberFormatSymbols_lkt', 'goog.i18n.CompactNumberFormatSymbols_lkt_US', 'goog.i18n.CompactNumberFormatSymbols_ln_AO', 'goog.i18n.CompactNumberFormatSymbols_ln_CF', 'goog.i18n.CompactNumberFormatSymbols_ln_CG', 'goog.i18n.CompactNumberFormatSymbols_lu', 'goog.i18n.CompactNumberFormatSymbols_lu_CD', 'goog.i18n.CompactNumberFormatSymbols_luo', 'goog.i18n.CompactNumberFormatSymbols_luo_KE', 'goog.i18n.CompactNumberFormatSymbols_luy', 'goog.i18n.CompactNumberFormatSymbols_luy_KE', 'goog.i18n.CompactNumberFormatSymbols_mas', 'goog.i18n.CompactNumberFormatSymbols_mas_KE', 'goog.i18n.CompactNumberFormatSymbols_mas_TZ', 'goog.i18n.CompactNumberFormatSymbols_mer', 'goog.i18n.CompactNumberFormatSymbols_mer_KE', 'goog.i18n.CompactNumberFormatSymbols_mfe', 'goog.i18n.CompactNumberFormatSymbols_mfe_MU', 'goog.i18n.CompactNumberFormatSymbols_mg', 'goog.i18n.CompactNumberFormatSymbols_mg_MG', 'goog.i18n.CompactNumberFormatSymbols_mgh', 'goog.i18n.CompactNumberFormatSymbols_mgh_MZ', 'goog.i18n.CompactNumberFormatSymbols_mgo', 'goog.i18n.CompactNumberFormatSymbols_mgo_CM', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_BN', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_SG', 'goog.i18n.CompactNumberFormatSymbols_mua', 'goog.i18n.CompactNumberFormatSymbols_mua_CM', 'goog.i18n.CompactNumberFormatSymbols_naq', 'goog.i18n.CompactNumberFormatSymbols_naq_NA', 'goog.i18n.CompactNumberFormatSymbols_nd', 'goog.i18n.CompactNumberFormatSymbols_nd_ZW', 'goog.i18n.CompactNumberFormatSymbols_ne_IN', 'goog.i18n.CompactNumberFormatSymbols_nl_AW', 'goog.i18n.CompactNumberFormatSymbols_nl_BE', 'goog.i18n.CompactNumberFormatSymbols_nl_BQ', 'goog.i18n.CompactNumberFormatSymbols_nl_CW', 'goog.i18n.CompactNumberFormatSymbols_nl_SR', 'goog.i18n.CompactNumberFormatSymbols_nl_SX', 'goog.i18n.CompactNumberFormatSymbols_nmg', 'goog.i18n.CompactNumberFormatSymbols_nmg_CM', 'goog.i18n.CompactNumberFormatSymbols_nn', 'goog.i18n.CompactNumberFormatSymbols_nn_NO', 'goog.i18n.CompactNumberFormatSymbols_nnh', 'goog.i18n.CompactNumberFormatSymbols_nnh_CM', 'goog.i18n.CompactNumberFormatSymbols_nus', 'goog.i18n.CompactNumberFormatSymbols_nus_SD', 'goog.i18n.CompactNumberFormatSymbols_nyn', 'goog.i18n.CompactNumberFormatSymbols_nyn_UG', 'goog.i18n.CompactNumberFormatSymbols_om', 'goog.i18n.CompactNumberFormatSymbols_om_ET', 'goog.i18n.CompactNumberFormatSymbols_om_KE', 'goog.i18n.CompactNumberFormatSymbols_os', 'goog.i18n.CompactNumberFormatSymbols_os_GE', 'goog.i18n.CompactNumberFormatSymbols_os_RU', 'goog.i18n.CompactNumberFormatSymbols_pa_Arab', 'goog.i18n.CompactNumberFormatSymbols_pa_Arab_PK', 'goog.i18n.CompactNumberFormatSymbols_ps', 'goog.i18n.CompactNumberFormatSymbols_ps_AF', 'goog.i18n.CompactNumberFormatSymbols_pt_AO', 'goog.i18n.CompactNumberFormatSymbols_pt_CV', 'goog.i18n.CompactNumberFormatSymbols_pt_GW', 'goog.i18n.CompactNumberFormatSymbols_pt_MO', 'goog.i18n.CompactNumberFormatSymbols_pt_MZ', 'goog.i18n.CompactNumberFormatSymbols_pt_ST', 'goog.i18n.CompactNumberFormatSymbols_pt_TL', 'goog.i18n.CompactNumberFormatSymbols_qu', 'goog.i18n.CompactNumberFormatSymbols_qu_BO', 'goog.i18n.CompactNumberFormatSymbols_qu_EC', 'goog.i18n.CompactNumberFormatSymbols_qu_PE', 'goog.i18n.CompactNumberFormatSymbols_rm', 'goog.i18n.CompactNumberFormatSymbols_rm_CH', 'goog.i18n.CompactNumberFormatSymbols_rn', 'goog.i18n.CompactNumberFormatSymbols_rn_BI', 'goog.i18n.CompactNumberFormatSymbols_ro_MD', 'goog.i18n.CompactNumberFormatSymbols_rof', 'goog.i18n.CompactNumberFormatSymbols_rof_TZ', 'goog.i18n.CompactNumberFormatSymbols_ru_BY', 'goog.i18n.CompactNumberFormatSymbols_ru_KG', 'goog.i18n.CompactNumberFormatSymbols_ru_KZ', 'goog.i18n.CompactNumberFormatSymbols_ru_MD', 'goog.i18n.CompactNumberFormatSymbols_ru_UA', 'goog.i18n.CompactNumberFormatSymbols_rw', 'goog.i18n.CompactNumberFormatSymbols_rw_RW', 'goog.i18n.CompactNumberFormatSymbols_rwk', 'goog.i18n.CompactNumberFormatSymbols_rwk_TZ', 'goog.i18n.CompactNumberFormatSymbols_sah', 'goog.i18n.CompactNumberFormatSymbols_sah_RU', 'goog.i18n.CompactNumberFormatSymbols_saq', 'goog.i18n.CompactNumberFormatSymbols_saq_KE', 'goog.i18n.CompactNumberFormatSymbols_sbp', 'goog.i18n.CompactNumberFormatSymbols_sbp_TZ', 'goog.i18n.CompactNumberFormatSymbols_se', 'goog.i18n.CompactNumberFormatSymbols_se_FI', 'goog.i18n.CompactNumberFormatSymbols_se_NO', 'goog.i18n.CompactNumberFormatSymbols_se_SE', 'goog.i18n.CompactNumberFormatSymbols_seh', 'goog.i18n.CompactNumberFormatSymbols_seh_MZ', 'goog.i18n.CompactNumberFormatSymbols_ses', 'goog.i18n.CompactNumberFormatSymbols_ses_ML', 'goog.i18n.CompactNumberFormatSymbols_sg', 'goog.i18n.CompactNumberFormatSymbols_sg_CF', 'goog.i18n.CompactNumberFormatSymbols_shi', 'goog.i18n.CompactNumberFormatSymbols_shi_Latn', 'goog.i18n.CompactNumberFormatSymbols_shi_Latn_MA', 'goog.i18n.CompactNumberFormatSymbols_shi_Tfng', 'goog.i18n.CompactNumberFormatSymbols_shi_Tfng_MA', 'goog.i18n.CompactNumberFormatSymbols_smn', 'goog.i18n.CompactNumberFormatSymbols_smn_FI', 'goog.i18n.CompactNumberFormatSymbols_sn', 'goog.i18n.CompactNumberFormatSymbols_sn_ZW', 'goog.i18n.CompactNumberFormatSymbols_so', 'goog.i18n.CompactNumberFormatSymbols_so_DJ', 'goog.i18n.CompactNumberFormatSymbols_so_ET', 'goog.i18n.CompactNumberFormatSymbols_so_KE', 'goog.i18n.CompactNumberFormatSymbols_so_SO', 'goog.i18n.CompactNumberFormatSymbols_sq_MK', 'goog.i18n.CompactNumberFormatSymbols_sq_XK', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_BA', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_ME', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_XK', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_BA', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_ME', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_XK', 'goog.i18n.CompactNumberFormatSymbols_sv_AX', 'goog.i18n.CompactNumberFormatSymbols_sv_FI', 'goog.i18n.CompactNumberFormatSymbols_sw_CD', 'goog.i18n.CompactNumberFormatSymbols_sw_KE', 'goog.i18n.CompactNumberFormatSymbols_sw_UG', 'goog.i18n.CompactNumberFormatSymbols_ta_LK', 'goog.i18n.CompactNumberFormatSymbols_ta_MY', 'goog.i18n.CompactNumberFormatSymbols_ta_SG', 'goog.i18n.CompactNumberFormatSymbols_teo', 'goog.i18n.CompactNumberFormatSymbols_teo_KE', 'goog.i18n.CompactNumberFormatSymbols_teo_UG', 'goog.i18n.CompactNumberFormatSymbols_ti', 'goog.i18n.CompactNumberFormatSymbols_ti_ER', 'goog.i18n.CompactNumberFormatSymbols_ti_ET', 'goog.i18n.CompactNumberFormatSymbols_to', 'goog.i18n.CompactNumberFormatSymbols_to_TO', 'goog.i18n.CompactNumberFormatSymbols_tr_CY', 'goog.i18n.CompactNumberFormatSymbols_twq', 'goog.i18n.CompactNumberFormatSymbols_twq_NE', 'goog.i18n.CompactNumberFormatSymbols_tzm', 'goog.i18n.CompactNumberFormatSymbols_tzm_Latn', 'goog.i18n.CompactNumberFormatSymbols_tzm_Latn_MA', 'goog.i18n.CompactNumberFormatSymbols_ug', 'goog.i18n.CompactNumberFormatSymbols_ug_Arab', 'goog.i18n.CompactNumberFormatSymbols_ug_Arab_CN', 'goog.i18n.CompactNumberFormatSymbols_ur_IN', 'goog.i18n.CompactNumberFormatSymbols_uz_Arab', 'goog.i18n.CompactNumberFormatSymbols_uz_Arab_AF', 'goog.i18n.CompactNumberFormatSymbols_uz_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_uz_Cyrl_UZ', 'goog.i18n.CompactNumberFormatSymbols_vai', 'goog.i18n.CompactNumberFormatSymbols_vai_Latn', 'goog.i18n.CompactNumberFormatSymbols_vai_Latn_LR', 'goog.i18n.CompactNumberFormatSymbols_vai_Vaii', 'goog.i18n.CompactNumberFormatSymbols_vai_Vaii_LR', 'goog.i18n.CompactNumberFormatSymbols_vun', 'goog.i18n.CompactNumberFormatSymbols_vun_TZ', 'goog.i18n.CompactNumberFormatSymbols_wae', 'goog.i18n.CompactNumberFormatSymbols_wae_CH', 'goog.i18n.CompactNumberFormatSymbols_xog', 'goog.i18n.CompactNumberFormatSymbols_xog_UG', 'goog.i18n.CompactNumberFormatSymbols_yav', 'goog.i18n.CompactNumberFormatSymbols_yav_CM', 'goog.i18n.CompactNumberFormatSymbols_yi', 'goog.i18n.CompactNumberFormatSymbols_yi_001', 'goog.i18n.CompactNumberFormatSymbols_yo', 'goog.i18n.CompactNumberFormatSymbols_yo_BJ', 'goog.i18n.CompactNumberFormatSymbols_yo_NG', 'goog.i18n.CompactNumberFormatSymbols_zgh', 'goog.i18n.CompactNumberFormatSymbols_zgh_MA', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_MO', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_SG', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_MO', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_TW'], [], false);
goog.addDependency('i18n/currency.js', ['goog.i18n.currency', 'goog.i18n.currency.CurrencyInfo', 'goog.i18n.currency.CurrencyInfoTier2'], [], false);
goog.addDependency('i18n/currency_test.js', ['goog.i18n.currencyTest'], ['goog.i18n.NumberFormat', 'goog.i18n.currency', 'goog.i18n.currency.CurrencyInfo', 'goog.object', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/currencycodemap.js', ['goog.i18n.currencyCodeMap', 'goog.i18n.currencyCodeMapTier2'], [], false);
goog.addDependency('i18n/datetimeformat.js', ['goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeFormat.Format'], ['goog.asserts', 'goog.date', 'goog.i18n.DateTimeSymbols', 'goog.i18n.TimeZone', 'goog.string'], false);
goog.addDependency('i18n/datetimeformat_test.js', ['goog.i18n.DateTimeFormatTest'], ['goog.date.Date', 'goog.date.DateTime', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimePatterns', 'goog.i18n.DateTimePatterns_ar', 'goog.i18n.DateTimePatterns_de', 'goog.i18n.DateTimePatterns_en', 'goog.i18n.DateTimePatterns_fa', 'goog.i18n.DateTimePatterns_fr', 'goog.i18n.DateTimePatterns_ja', 'goog.i18n.DateTimePatterns_sv', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_ar', 'goog.i18n.DateTimeSymbols_ar_AE', 'goog.i18n.DateTimeSymbols_ar_SA', 'goog.i18n.DateTimeSymbols_bn_BD', 'goog.i18n.DateTimeSymbols_de', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_en_GB', 'goog.i18n.DateTimeSymbols_en_IE', 'goog.i18n.DateTimeSymbols_en_IN', 'goog.i18n.DateTimeSymbols_en_US', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.DateTimeSymbols_fr', 'goog.i18n.DateTimeSymbols_fr_DJ', 'goog.i18n.DateTimeSymbols_he_IL', 'goog.i18n.DateTimeSymbols_ja', 'goog.i18n.DateTimeSymbols_ro_RO', 'goog.i18n.DateTimeSymbols_sv', 'goog.i18n.TimeZone', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/datetimeparse.js', ['goog.i18n.DateTimeParse'], ['goog.asserts', 'goog.date', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols'], false);
goog.addDependency('i18n/datetimeparse_test.js', ['goog.i18n.DateTimeParseTest'], ['goog.date.Date', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeParse', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.DateTimeSymbols_fr', 'goog.i18n.DateTimeSymbols_pl', 'goog.i18n.DateTimeSymbols_zh', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('i18n/datetimepatterns.js', ['goog.i18n.DateTimePatterns', 'goog.i18n.DateTimePatterns_af', 'goog.i18n.DateTimePatterns_am', 'goog.i18n.DateTimePatterns_ar', 'goog.i18n.DateTimePatterns_az', 'goog.i18n.DateTimePatterns_be', 'goog.i18n.DateTimePatterns_bg', 'goog.i18n.DateTimePatterns_bn', 'goog.i18n.DateTimePatterns_br', 'goog.i18n.DateTimePatterns_bs', 'goog.i18n.DateTimePatterns_ca', 'goog.i18n.DateTimePatterns_chr', 'goog.i18n.DateTimePatterns_cs', 'goog.i18n.DateTimePatterns_cy', 'goog.i18n.DateTimePatterns_da', 'goog.i18n.DateTimePatterns_de', 'goog.i18n.DateTimePatterns_de_AT', 'goog.i18n.DateTimePatterns_de_CH', 'goog.i18n.DateTimePatterns_el', 'goog.i18n.DateTimePatterns_en', 'goog.i18n.DateTimePatterns_en_AU', 'goog.i18n.DateTimePatterns_en_CA', 'goog.i18n.DateTimePatterns_en_GB', 'goog.i18n.DateTimePatterns_en_IE', 'goog.i18n.DateTimePatterns_en_IN', 'goog.i18n.DateTimePatterns_en_SG', 'goog.i18n.DateTimePatterns_en_US', 'goog.i18n.DateTimePatterns_en_ZA', 'goog.i18n.DateTimePatterns_es', 'goog.i18n.DateTimePatterns_es_419', 'goog.i18n.DateTimePatterns_es_ES', 'goog.i18n.DateTimePatterns_es_MX', 'goog.i18n.DateTimePatterns_es_US', 'goog.i18n.DateTimePatterns_et', 'goog.i18n.DateTimePatterns_eu', 'goog.i18n.DateTimePatterns_fa', 'goog.i18n.DateTimePatterns_fi', 'goog.i18n.DateTimePatterns_fil', 'goog.i18n.DateTimePatterns_fr', 'goog.i18n.DateTimePatterns_fr_CA', 'goog.i18n.DateTimePatterns_ga', 'goog.i18n.DateTimePatterns_gl', 'goog.i18n.DateTimePatterns_gsw', 'goog.i18n.DateTimePatterns_gu', 'goog.i18n.DateTimePatterns_haw', 'goog.i18n.DateTimePatterns_he', 'goog.i18n.DateTimePatterns_hi', 'goog.i18n.DateTimePatterns_hr', 'goog.i18n.DateTimePatterns_hu', 'goog.i18n.DateTimePatterns_hy', 'goog.i18n.DateTimePatterns_id', 'goog.i18n.DateTimePatterns_in', 'goog.i18n.DateTimePatterns_is', 'goog.i18n.DateTimePatterns_it', 'goog.i18n.DateTimePatterns_iw', 'goog.i18n.DateTimePatterns_ja', 'goog.i18n.DateTimePatterns_ka', 'goog.i18n.DateTimePatterns_kk', 'goog.i18n.DateTimePatterns_km', 'goog.i18n.DateTimePatterns_kn', 'goog.i18n.DateTimePatterns_ko', 'goog.i18n.DateTimePatterns_ky', 'goog.i18n.DateTimePatterns_ln', 'goog.i18n.DateTimePatterns_lo', 'goog.i18n.DateTimePatterns_lt', 'goog.i18n.DateTimePatterns_lv', 'goog.i18n.DateTimePatterns_mk', 'goog.i18n.DateTimePatterns_ml', 'goog.i18n.DateTimePatterns_mn', 'goog.i18n.DateTimePatterns_mo', 'goog.i18n.DateTimePatterns_mr', 'goog.i18n.DateTimePatterns_ms', 'goog.i18n.DateTimePatterns_mt', 'goog.i18n.DateTimePatterns_my', 'goog.i18n.DateTimePatterns_nb', 'goog.i18n.DateTimePatterns_ne', 'goog.i18n.DateTimePatterns_nl', 'goog.i18n.DateTimePatterns_no', 'goog.i18n.DateTimePatterns_no_NO', 'goog.i18n.DateTimePatterns_or', 'goog.i18n.DateTimePatterns_pa', 'goog.i18n.DateTimePatterns_pl', 'goog.i18n.DateTimePatterns_pt', 'goog.i18n.DateTimePatterns_pt_BR', 'goog.i18n.DateTimePatterns_pt_PT', 'goog.i18n.DateTimePatterns_ro', 'goog.i18n.DateTimePatterns_ru', 'goog.i18n.DateTimePatterns_sh', 'goog.i18n.DateTimePatterns_si', 'goog.i18n.DateTimePatterns_sk', 'goog.i18n.DateTimePatterns_sl', 'goog.i18n.DateTimePatterns_sq', 'goog.i18n.DateTimePatterns_sr', 'goog.i18n.DateTimePatterns_sr_Latn', 'goog.i18n.DateTimePatterns_sv', 'goog.i18n.DateTimePatterns_sw', 'goog.i18n.DateTimePatterns_ta', 'goog.i18n.DateTimePatterns_te', 'goog.i18n.DateTimePatterns_th', 'goog.i18n.DateTimePatterns_tl', 'goog.i18n.DateTimePatterns_tr', 'goog.i18n.DateTimePatterns_uk', 'goog.i18n.DateTimePatterns_ur', 'goog.i18n.DateTimePatterns_uz', 'goog.i18n.DateTimePatterns_vi', 'goog.i18n.DateTimePatterns_zh', 'goog.i18n.DateTimePatterns_zh_CN', 'goog.i18n.DateTimePatterns_zh_HK', 'goog.i18n.DateTimePatterns_zh_TW', 'goog.i18n.DateTimePatterns_zu'], [], false);
goog.addDependency('i18n/datetimepatternsext.js', ['goog.i18n.DateTimePatternsExt', 'goog.i18n.DateTimePatterns_af_NA', 'goog.i18n.DateTimePatterns_af_ZA', 'goog.i18n.DateTimePatterns_agq', 'goog.i18n.DateTimePatterns_agq_CM', 'goog.i18n.DateTimePatterns_ak', 'goog.i18n.DateTimePatterns_ak_GH', 'goog.i18n.DateTimePatterns_am_ET', 'goog.i18n.DateTimePatterns_ar_001', 'goog.i18n.DateTimePatterns_ar_AE', 'goog.i18n.DateTimePatterns_ar_BH', 'goog.i18n.DateTimePatterns_ar_DJ', 'goog.i18n.DateTimePatterns_ar_DZ', 'goog.i18n.DateTimePatterns_ar_EG', 'goog.i18n.DateTimePatterns_ar_EH', 'goog.i18n.DateTimePatterns_ar_ER', 'goog.i18n.DateTimePatterns_ar_IL', 'goog.i18n.DateTimePatterns_ar_IQ', 'goog.i18n.DateTimePatterns_ar_JO', 'goog.i18n.DateTimePatterns_ar_KM', 'goog.i18n.DateTimePatterns_ar_KW', 'goog.i18n.DateTimePatterns_ar_LB', 'goog.i18n.DateTimePatterns_ar_LY', 'goog.i18n.DateTimePatterns_ar_MA', 'goog.i18n.DateTimePatterns_ar_MR', 'goog.i18n.DateTimePatterns_ar_OM', 'goog.i18n.DateTimePatterns_ar_PS', 'goog.i18n.DateTimePatterns_ar_QA', 'goog.i18n.DateTimePatterns_ar_SA', 'goog.i18n.DateTimePatterns_ar_SD', 'goog.i18n.DateTimePatterns_ar_SO', 'goog.i18n.DateTimePatterns_ar_SS', 'goog.i18n.DateTimePatterns_ar_SY', 'goog.i18n.DateTimePatterns_ar_TD', 'goog.i18n.DateTimePatterns_ar_TN', 'goog.i18n.DateTimePatterns_ar_YE', 'goog.i18n.DateTimePatterns_as', 'goog.i18n.DateTimePatterns_as_IN', 'goog.i18n.DateTimePatterns_asa', 'goog.i18n.DateTimePatterns_asa_TZ', 'goog.i18n.DateTimePatterns_az_Cyrl', 'goog.i18n.DateTimePatterns_az_Cyrl_AZ', 'goog.i18n.DateTimePatterns_az_Latn', 'goog.i18n.DateTimePatterns_az_Latn_AZ', 'goog.i18n.DateTimePatterns_bas', 'goog.i18n.DateTimePatterns_bas_CM', 'goog.i18n.DateTimePatterns_be_BY', 'goog.i18n.DateTimePatterns_bem', 'goog.i18n.DateTimePatterns_bem_ZM', 'goog.i18n.DateTimePatterns_bez', 'goog.i18n.DateTimePatterns_bez_TZ', 'goog.i18n.DateTimePatterns_bg_BG', 'goog.i18n.DateTimePatterns_bm', 'goog.i18n.DateTimePatterns_bm_Latn', 'goog.i18n.DateTimePatterns_bm_Latn_ML', 'goog.i18n.DateTimePatterns_bn_BD', 'goog.i18n.DateTimePatterns_bn_IN', 'goog.i18n.DateTimePatterns_bo', 'goog.i18n.DateTimePatterns_bo_CN', 'goog.i18n.DateTimePatterns_bo_IN', 'goog.i18n.DateTimePatterns_br_FR', 'goog.i18n.DateTimePatterns_brx', 'goog.i18n.DateTimePatterns_brx_IN', 'goog.i18n.DateTimePatterns_bs_Cyrl', 'goog.i18n.DateTimePatterns_bs_Cyrl_BA', 'goog.i18n.DateTimePatterns_bs_Latn', 'goog.i18n.DateTimePatterns_bs_Latn_BA', 'goog.i18n.DateTimePatterns_ca_AD', 'goog.i18n.DateTimePatterns_ca_ES', 'goog.i18n.DateTimePatterns_ca_FR', 'goog.i18n.DateTimePatterns_ca_IT', 'goog.i18n.DateTimePatterns_cgg', 'goog.i18n.DateTimePatterns_cgg_UG', 'goog.i18n.DateTimePatterns_chr_US', 'goog.i18n.DateTimePatterns_cs_CZ', 'goog.i18n.DateTimePatterns_cy_GB', 'goog.i18n.DateTimePatterns_da_DK', 'goog.i18n.DateTimePatterns_da_GL', 'goog.i18n.DateTimePatterns_dav', 'goog.i18n.DateTimePatterns_dav_KE', 'goog.i18n.DateTimePatterns_de_BE', 'goog.i18n.DateTimePatterns_de_DE', 'goog.i18n.DateTimePatterns_de_LI', 'goog.i18n.DateTimePatterns_de_LU', 'goog.i18n.DateTimePatterns_dje', 'goog.i18n.DateTimePatterns_dje_NE', 'goog.i18n.DateTimePatterns_dsb', 'goog.i18n.DateTimePatterns_dsb_DE', 'goog.i18n.DateTimePatterns_dua', 'goog.i18n.DateTimePatterns_dua_CM', 'goog.i18n.DateTimePatterns_dyo', 'goog.i18n.DateTimePatterns_dyo_SN', 'goog.i18n.DateTimePatterns_dz', 'goog.i18n.DateTimePatterns_dz_BT', 'goog.i18n.DateTimePatterns_ebu', 'goog.i18n.DateTimePatterns_ebu_KE', 'goog.i18n.DateTimePatterns_ee', 'goog.i18n.DateTimePatterns_ee_GH', 'goog.i18n.DateTimePatterns_ee_TG', 'goog.i18n.DateTimePatterns_el_CY', 'goog.i18n.DateTimePatterns_el_GR', 'goog.i18n.DateTimePatterns_en_001', 'goog.i18n.DateTimePatterns_en_150', 'goog.i18n.DateTimePatterns_en_AG', 'goog.i18n.DateTimePatterns_en_AI', 'goog.i18n.DateTimePatterns_en_AS', 'goog.i18n.DateTimePatterns_en_BB', 'goog.i18n.DateTimePatterns_en_BE', 'goog.i18n.DateTimePatterns_en_BM', 'goog.i18n.DateTimePatterns_en_BS', 'goog.i18n.DateTimePatterns_en_BW', 'goog.i18n.DateTimePatterns_en_BZ', 'goog.i18n.DateTimePatterns_en_CC', 'goog.i18n.DateTimePatterns_en_CK', 'goog.i18n.DateTimePatterns_en_CM', 'goog.i18n.DateTimePatterns_en_CX', 'goog.i18n.DateTimePatterns_en_DG', 'goog.i18n.DateTimePatterns_en_DM', 'goog.i18n.DateTimePatterns_en_ER', 'goog.i18n.DateTimePatterns_en_FJ', 'goog.i18n.DateTimePatterns_en_FK', 'goog.i18n.DateTimePatterns_en_FM', 'goog.i18n.DateTimePatterns_en_GD', 'goog.i18n.DateTimePatterns_en_GG', 'goog.i18n.DateTimePatterns_en_GH', 'goog.i18n.DateTimePatterns_en_GI', 'goog.i18n.DateTimePatterns_en_GM', 'goog.i18n.DateTimePatterns_en_GU', 'goog.i18n.DateTimePatterns_en_GY', 'goog.i18n.DateTimePatterns_en_HK', 'goog.i18n.DateTimePatterns_en_IM', 'goog.i18n.DateTimePatterns_en_IO', 'goog.i18n.DateTimePatterns_en_JE', 'goog.i18n.DateTimePatterns_en_JM', 'goog.i18n.DateTimePatterns_en_KE', 'goog.i18n.DateTimePatterns_en_KI', 'goog.i18n.DateTimePatterns_en_KN', 'goog.i18n.DateTimePatterns_en_KY', 'goog.i18n.DateTimePatterns_en_LC', 'goog.i18n.DateTimePatterns_en_LR', 'goog.i18n.DateTimePatterns_en_LS', 'goog.i18n.DateTimePatterns_en_MG', 'goog.i18n.DateTimePatterns_en_MH', 'goog.i18n.DateTimePatterns_en_MO', 'goog.i18n.DateTimePatterns_en_MP', 'goog.i18n.DateTimePatterns_en_MS', 'goog.i18n.DateTimePatterns_en_MT', 'goog.i18n.DateTimePatterns_en_MU', 'goog.i18n.DateTimePatterns_en_MW', 'goog.i18n.DateTimePatterns_en_MY', 'goog.i18n.DateTimePatterns_en_NA', 'goog.i18n.DateTimePatterns_en_NF', 'goog.i18n.DateTimePatterns_en_NG', 'goog.i18n.DateTimePatterns_en_NR', 'goog.i18n.DateTimePatterns_en_NU', 'goog.i18n.DateTimePatterns_en_NZ', 'goog.i18n.DateTimePatterns_en_PG', 'goog.i18n.DateTimePatterns_en_PH', 'goog.i18n.DateTimePatterns_en_PK', 'goog.i18n.DateTimePatterns_en_PN', 'goog.i18n.DateTimePatterns_en_PR', 'goog.i18n.DateTimePatterns_en_PW', 'goog.i18n.DateTimePatterns_en_RW', 'goog.i18n.DateTimePatterns_en_SB', 'goog.i18n.DateTimePatterns_en_SC', 'goog.i18n.DateTimePatterns_en_SD', 'goog.i18n.DateTimePatterns_en_SH', 'goog.i18n.DateTimePatterns_en_SL', 'goog.i18n.DateTimePatterns_en_SS', 'goog.i18n.DateTimePatterns_en_SX', 'goog.i18n.DateTimePatterns_en_SZ', 'goog.i18n.DateTimePatterns_en_TC', 'goog.i18n.DateTimePatterns_en_TK', 'goog.i18n.DateTimePatterns_en_TO', 'goog.i18n.DateTimePatterns_en_TT', 'goog.i18n.DateTimePatterns_en_TV', 'goog.i18n.DateTimePatterns_en_TZ', 'goog.i18n.DateTimePatterns_en_UG', 'goog.i18n.DateTimePatterns_en_UM', 'goog.i18n.DateTimePatterns_en_US_POSIX', 'goog.i18n.DateTimePatterns_en_VC', 'goog.i18n.DateTimePatterns_en_VG', 'goog.i18n.DateTimePatterns_en_VI', 'goog.i18n.DateTimePatterns_en_VU', 'goog.i18n.DateTimePatterns_en_WS', 'goog.i18n.DateTimePatterns_en_ZM', 'goog.i18n.DateTimePatterns_en_ZW', 'goog.i18n.DateTimePatterns_eo', 'goog.i18n.DateTimePatterns_es_AR', 'goog.i18n.DateTimePatterns_es_BO', 'goog.i18n.DateTimePatterns_es_CL', 'goog.i18n.DateTimePatterns_es_CO', 'goog.i18n.DateTimePatterns_es_CR', 'goog.i18n.DateTimePatterns_es_CU', 'goog.i18n.DateTimePatterns_es_DO', 'goog.i18n.DateTimePatterns_es_EA', 'goog.i18n.DateTimePatterns_es_EC', 'goog.i18n.DateTimePatterns_es_GQ', 'goog.i18n.DateTimePatterns_es_GT', 'goog.i18n.DateTimePatterns_es_HN', 'goog.i18n.DateTimePatterns_es_IC', 'goog.i18n.DateTimePatterns_es_NI', 'goog.i18n.DateTimePatterns_es_PA', 'goog.i18n.DateTimePatterns_es_PE', 'goog.i18n.DateTimePatterns_es_PH', 'goog.i18n.DateTimePatterns_es_PR', 'goog.i18n.DateTimePatterns_es_PY', 'goog.i18n.DateTimePatterns_es_SV', 'goog.i18n.DateTimePatterns_es_UY', 'goog.i18n.DateTimePatterns_es_VE', 'goog.i18n.DateTimePatterns_et_EE', 'goog.i18n.DateTimePatterns_eu_ES', 'goog.i18n.DateTimePatterns_ewo', 'goog.i18n.DateTimePatterns_ewo_CM', 'goog.i18n.DateTimePatterns_fa_AF', 'goog.i18n.DateTimePatterns_fa_IR', 'goog.i18n.DateTimePatterns_ff', 'goog.i18n.DateTimePatterns_ff_CM', 'goog.i18n.DateTimePatterns_ff_GN', 'goog.i18n.DateTimePatterns_ff_MR', 'goog.i18n.DateTimePatterns_ff_SN', 'goog.i18n.DateTimePatterns_fi_FI', 'goog.i18n.DateTimePatterns_fil_PH', 'goog.i18n.DateTimePatterns_fo', 'goog.i18n.DateTimePatterns_fo_FO', 'goog.i18n.DateTimePatterns_fr_BE', 'goog.i18n.DateTimePatterns_fr_BF', 'goog.i18n.DateTimePatterns_fr_BI', 'goog.i18n.DateTimePatterns_fr_BJ', 'goog.i18n.DateTimePatterns_fr_BL', 'goog.i18n.DateTimePatterns_fr_CD', 'goog.i18n.DateTimePatterns_fr_CF', 'goog.i18n.DateTimePatterns_fr_CG', 'goog.i18n.DateTimePatterns_fr_CH', 'goog.i18n.DateTimePatterns_fr_CI', 'goog.i18n.DateTimePatterns_fr_CM', 'goog.i18n.DateTimePatterns_fr_DJ', 'goog.i18n.DateTimePatterns_fr_DZ', 'goog.i18n.DateTimePatterns_fr_FR', 'goog.i18n.DateTimePatterns_fr_GA', 'goog.i18n.DateTimePatterns_fr_GF', 'goog.i18n.DateTimePatterns_fr_GN', 'goog.i18n.DateTimePatterns_fr_GP', 'goog.i18n.DateTimePatterns_fr_GQ', 'goog.i18n.DateTimePatterns_fr_HT', 'goog.i18n.DateTimePatterns_fr_KM', 'goog.i18n.DateTimePatterns_fr_LU', 'goog.i18n.DateTimePatterns_fr_MA', 'goog.i18n.DateTimePatterns_fr_MC', 'goog.i18n.DateTimePatterns_fr_MF', 'goog.i18n.DateTimePatterns_fr_MG', 'goog.i18n.DateTimePatterns_fr_ML', 'goog.i18n.DateTimePatterns_fr_MQ', 'goog.i18n.DateTimePatterns_fr_MR', 'goog.i18n.DateTimePatterns_fr_MU', 'goog.i18n.DateTimePatterns_fr_NC', 'goog.i18n.DateTimePatterns_fr_NE', 'goog.i18n.DateTimePatterns_fr_PF', 'goog.i18n.DateTimePatterns_fr_PM', 'goog.i18n.DateTimePatterns_fr_RE', 'goog.i18n.DateTimePatterns_fr_RW', 'goog.i18n.DateTimePatterns_fr_SC', 'goog.i18n.DateTimePatterns_fr_SN', 'goog.i18n.DateTimePatterns_fr_SY', 'goog.i18n.DateTimePatterns_fr_TD', 'goog.i18n.DateTimePatterns_fr_TG', 'goog.i18n.DateTimePatterns_fr_TN', 'goog.i18n.DateTimePatterns_fr_VU', 'goog.i18n.DateTimePatterns_fr_WF', 'goog.i18n.DateTimePatterns_fr_YT', 'goog.i18n.DateTimePatterns_fur', 'goog.i18n.DateTimePatterns_fur_IT', 'goog.i18n.DateTimePatterns_fy', 'goog.i18n.DateTimePatterns_fy_NL', 'goog.i18n.DateTimePatterns_ga_IE', 'goog.i18n.DateTimePatterns_gd', 'goog.i18n.DateTimePatterns_gd_GB', 'goog.i18n.DateTimePatterns_gl_ES', 'goog.i18n.DateTimePatterns_gsw_CH', 'goog.i18n.DateTimePatterns_gsw_FR', 'goog.i18n.DateTimePatterns_gsw_LI', 'goog.i18n.DateTimePatterns_gu_IN', 'goog.i18n.DateTimePatterns_guz', 'goog.i18n.DateTimePatterns_guz_KE', 'goog.i18n.DateTimePatterns_gv', 'goog.i18n.DateTimePatterns_gv_IM', 'goog.i18n.DateTimePatterns_ha', 'goog.i18n.DateTimePatterns_ha_Latn', 'goog.i18n.DateTimePatterns_ha_Latn_GH', 'goog.i18n.DateTimePatterns_ha_Latn_NE', 'goog.i18n.DateTimePatterns_ha_Latn_NG', 'goog.i18n.DateTimePatterns_haw_US', 'goog.i18n.DateTimePatterns_he_IL', 'goog.i18n.DateTimePatterns_hi_IN', 'goog.i18n.DateTimePatterns_hr_BA', 'goog.i18n.DateTimePatterns_hr_HR', 'goog.i18n.DateTimePatterns_hsb', 'goog.i18n.DateTimePatterns_hsb_DE', 'goog.i18n.DateTimePatterns_hu_HU', 'goog.i18n.DateTimePatterns_hy_AM', 'goog.i18n.DateTimePatterns_id_ID', 'goog.i18n.DateTimePatterns_ig', 'goog.i18n.DateTimePatterns_ig_NG', 'goog.i18n.DateTimePatterns_ii', 'goog.i18n.DateTimePatterns_ii_CN', 'goog.i18n.DateTimePatterns_is_IS', 'goog.i18n.DateTimePatterns_it_CH', 'goog.i18n.DateTimePatterns_it_IT', 'goog.i18n.DateTimePatterns_it_SM', 'goog.i18n.DateTimePatterns_ja_JP', 'goog.i18n.DateTimePatterns_jgo', 'goog.i18n.DateTimePatterns_jgo_CM', 'goog.i18n.DateTimePatterns_jmc', 'goog.i18n.DateTimePatterns_jmc_TZ', 'goog.i18n.DateTimePatterns_ka_GE', 'goog.i18n.DateTimePatterns_kab', 'goog.i18n.DateTimePatterns_kab_DZ', 'goog.i18n.DateTimePatterns_kam', 'goog.i18n.DateTimePatterns_kam_KE', 'goog.i18n.DateTimePatterns_kde', 'goog.i18n.DateTimePatterns_kde_TZ', 'goog.i18n.DateTimePatterns_kea', 'goog.i18n.DateTimePatterns_kea_CV', 'goog.i18n.DateTimePatterns_khq', 'goog.i18n.DateTimePatterns_khq_ML', 'goog.i18n.DateTimePatterns_ki', 'goog.i18n.DateTimePatterns_ki_KE', 'goog.i18n.DateTimePatterns_kk_Cyrl', 'goog.i18n.DateTimePatterns_kk_Cyrl_KZ', 'goog.i18n.DateTimePatterns_kkj', 'goog.i18n.DateTimePatterns_kkj_CM', 'goog.i18n.DateTimePatterns_kl', 'goog.i18n.DateTimePatterns_kl_GL', 'goog.i18n.DateTimePatterns_kln', 'goog.i18n.DateTimePatterns_kln_KE', 'goog.i18n.DateTimePatterns_km_KH', 'goog.i18n.DateTimePatterns_kn_IN', 'goog.i18n.DateTimePatterns_ko_KP', 'goog.i18n.DateTimePatterns_ko_KR', 'goog.i18n.DateTimePatterns_kok', 'goog.i18n.DateTimePatterns_kok_IN', 'goog.i18n.DateTimePatterns_ks', 'goog.i18n.DateTimePatterns_ks_Arab', 'goog.i18n.DateTimePatterns_ks_Arab_IN', 'goog.i18n.DateTimePatterns_ksb', 'goog.i18n.DateTimePatterns_ksb_TZ', 'goog.i18n.DateTimePatterns_ksf', 'goog.i18n.DateTimePatterns_ksf_CM', 'goog.i18n.DateTimePatterns_ksh', 'goog.i18n.DateTimePatterns_ksh_DE', 'goog.i18n.DateTimePatterns_kw', 'goog.i18n.DateTimePatterns_kw_GB', 'goog.i18n.DateTimePatterns_ky_Cyrl', 'goog.i18n.DateTimePatterns_ky_Cyrl_KG', 'goog.i18n.DateTimePatterns_lag', 'goog.i18n.DateTimePatterns_lag_TZ', 'goog.i18n.DateTimePatterns_lb', 'goog.i18n.DateTimePatterns_lb_LU', 'goog.i18n.DateTimePatterns_lg', 'goog.i18n.DateTimePatterns_lg_UG', 'goog.i18n.DateTimePatterns_lkt', 'goog.i18n.DateTimePatterns_lkt_US', 'goog.i18n.DateTimePatterns_ln_AO', 'goog.i18n.DateTimePatterns_ln_CD', 'goog.i18n.DateTimePatterns_ln_CF', 'goog.i18n.DateTimePatterns_ln_CG', 'goog.i18n.DateTimePatterns_lo_LA', 'goog.i18n.DateTimePatterns_lt_LT', 'goog.i18n.DateTimePatterns_lu', 'goog.i18n.DateTimePatterns_lu_CD', 'goog.i18n.DateTimePatterns_luo', 'goog.i18n.DateTimePatterns_luo_KE', 'goog.i18n.DateTimePatterns_luy', 'goog.i18n.DateTimePatterns_luy_KE', 'goog.i18n.DateTimePatterns_lv_LV', 'goog.i18n.DateTimePatterns_mas', 'goog.i18n.DateTimePatterns_mas_KE', 'goog.i18n.DateTimePatterns_mas_TZ', 'goog.i18n.DateTimePatterns_mer', 'goog.i18n.DateTimePatterns_mer_KE', 'goog.i18n.DateTimePatterns_mfe', 'goog.i18n.DateTimePatterns_mfe_MU', 'goog.i18n.DateTimePatterns_mg', 'goog.i18n.DateTimePatterns_mg_MG', 'goog.i18n.DateTimePatterns_mgh', 'goog.i18n.DateTimePatterns_mgh_MZ', 'goog.i18n.DateTimePatterns_mgo', 'goog.i18n.DateTimePatterns_mgo_CM', 'goog.i18n.DateTimePatterns_mk_MK', 'goog.i18n.DateTimePatterns_ml_IN', 'goog.i18n.DateTimePatterns_mn_Cyrl', 'goog.i18n.DateTimePatterns_mn_Cyrl_MN', 'goog.i18n.DateTimePatterns_mr_IN', 'goog.i18n.DateTimePatterns_ms_Latn', 'goog.i18n.DateTimePatterns_ms_Latn_BN', 'goog.i18n.DateTimePatterns_ms_Latn_MY', 'goog.i18n.DateTimePatterns_ms_Latn_SG', 'goog.i18n.DateTimePatterns_mt_MT', 'goog.i18n.DateTimePatterns_mua', 'goog.i18n.DateTimePatterns_mua_CM', 'goog.i18n.DateTimePatterns_my_MM', 'goog.i18n.DateTimePatterns_naq', 'goog.i18n.DateTimePatterns_naq_NA', 'goog.i18n.DateTimePatterns_nb_NO', 'goog.i18n.DateTimePatterns_nb_SJ', 'goog.i18n.DateTimePatterns_nd', 'goog.i18n.DateTimePatterns_nd_ZW', 'goog.i18n.DateTimePatterns_ne_IN', 'goog.i18n.DateTimePatterns_ne_NP', 'goog.i18n.DateTimePatterns_nl_AW', 'goog.i18n.DateTimePatterns_nl_BE', 'goog.i18n.DateTimePatterns_nl_BQ', 'goog.i18n.DateTimePatterns_nl_CW', 'goog.i18n.DateTimePatterns_nl_NL', 'goog.i18n.DateTimePatterns_nl_SR', 'goog.i18n.DateTimePatterns_nl_SX', 'goog.i18n.DateTimePatterns_nmg', 'goog.i18n.DateTimePatterns_nmg_CM', 'goog.i18n.DateTimePatterns_nn', 'goog.i18n.DateTimePatterns_nn_NO', 'goog.i18n.DateTimePatterns_nnh', 'goog.i18n.DateTimePatterns_nnh_CM', 'goog.i18n.DateTimePatterns_nus', 'goog.i18n.DateTimePatterns_nus_SD', 'goog.i18n.DateTimePatterns_nyn', 'goog.i18n.DateTimePatterns_nyn_UG', 'goog.i18n.DateTimePatterns_om', 'goog.i18n.DateTimePatterns_om_ET', 'goog.i18n.DateTimePatterns_om_KE', 'goog.i18n.DateTimePatterns_or_IN', 'goog.i18n.DateTimePatterns_os', 'goog.i18n.DateTimePatterns_os_GE', 'goog.i18n.DateTimePatterns_os_RU', 'goog.i18n.DateTimePatterns_pa_Arab', 'goog.i18n.DateTimePatterns_pa_Arab_PK', 'goog.i18n.DateTimePatterns_pa_Guru', 'goog.i18n.DateTimePatterns_pa_Guru_IN', 'goog.i18n.DateTimePatterns_pl_PL', 'goog.i18n.DateTimePatterns_ps', 'goog.i18n.DateTimePatterns_ps_AF', 'goog.i18n.DateTimePatterns_pt_AO', 'goog.i18n.DateTimePatterns_pt_CV', 'goog.i18n.DateTimePatterns_pt_GW', 'goog.i18n.DateTimePatterns_pt_MO', 'goog.i18n.DateTimePatterns_pt_MZ', 'goog.i18n.DateTimePatterns_pt_ST', 'goog.i18n.DateTimePatterns_pt_TL', 'goog.i18n.DateTimePatterns_qu', 'goog.i18n.DateTimePatterns_qu_BO', 'goog.i18n.DateTimePatterns_qu_EC', 'goog.i18n.DateTimePatterns_qu_PE', 'goog.i18n.DateTimePatterns_rm', 'goog.i18n.DateTimePatterns_rm_CH', 'goog.i18n.DateTimePatterns_rn', 'goog.i18n.DateTimePatterns_rn_BI', 'goog.i18n.DateTimePatterns_ro_MD', 'goog.i18n.DateTimePatterns_ro_RO', 'goog.i18n.DateTimePatterns_rof', 'goog.i18n.DateTimePatterns_rof_TZ', 'goog.i18n.DateTimePatterns_ru_BY', 'goog.i18n.DateTimePatterns_ru_KG', 'goog.i18n.DateTimePatterns_ru_KZ', 'goog.i18n.DateTimePatterns_ru_MD', 'goog.i18n.DateTimePatterns_ru_RU', 'goog.i18n.DateTimePatterns_ru_UA', 'goog.i18n.DateTimePatterns_rw', 'goog.i18n.DateTimePatterns_rw_RW', 'goog.i18n.DateTimePatterns_rwk', 'goog.i18n.DateTimePatterns_rwk_TZ', 'goog.i18n.DateTimePatterns_sah', 'goog.i18n.DateTimePatterns_sah_RU', 'goog.i18n.DateTimePatterns_saq', 'goog.i18n.DateTimePatterns_saq_KE', 'goog.i18n.DateTimePatterns_sbp', 'goog.i18n.DateTimePatterns_sbp_TZ', 'goog.i18n.DateTimePatterns_se', 'goog.i18n.DateTimePatterns_se_FI', 'goog.i18n.DateTimePatterns_se_NO', 'goog.i18n.DateTimePatterns_se_SE', 'goog.i18n.DateTimePatterns_seh', 'goog.i18n.DateTimePatterns_seh_MZ', 'goog.i18n.DateTimePatterns_ses', 'goog.i18n.DateTimePatterns_ses_ML', 'goog.i18n.DateTimePatterns_sg', 'goog.i18n.DateTimePatterns_sg_CF', 'goog.i18n.DateTimePatterns_shi', 'goog.i18n.DateTimePatterns_shi_Latn', 'goog.i18n.DateTimePatterns_shi_Latn_MA', 'goog.i18n.DateTimePatterns_shi_Tfng', 'goog.i18n.DateTimePatterns_shi_Tfng_MA', 'goog.i18n.DateTimePatterns_si_LK', 'goog.i18n.DateTimePatterns_sk_SK', 'goog.i18n.DateTimePatterns_sl_SI', 'goog.i18n.DateTimePatterns_smn', 'goog.i18n.DateTimePatterns_smn_FI', 'goog.i18n.DateTimePatterns_sn', 'goog.i18n.DateTimePatterns_sn_ZW', 'goog.i18n.DateTimePatterns_so', 'goog.i18n.DateTimePatterns_so_DJ', 'goog.i18n.DateTimePatterns_so_ET', 'goog.i18n.DateTimePatterns_so_KE', 'goog.i18n.DateTimePatterns_so_SO', 'goog.i18n.DateTimePatterns_sq_AL', 'goog.i18n.DateTimePatterns_sq_MK', 'goog.i18n.DateTimePatterns_sq_XK', 'goog.i18n.DateTimePatterns_sr_Cyrl', 'goog.i18n.DateTimePatterns_sr_Cyrl_BA', 'goog.i18n.DateTimePatterns_sr_Cyrl_ME', 'goog.i18n.DateTimePatterns_sr_Cyrl_RS', 'goog.i18n.DateTimePatterns_sr_Cyrl_XK', 'goog.i18n.DateTimePatterns_sr_Latn_BA', 'goog.i18n.DateTimePatterns_sr_Latn_ME', 'goog.i18n.DateTimePatterns_sr_Latn_RS', 'goog.i18n.DateTimePatterns_sr_Latn_XK', 'goog.i18n.DateTimePatterns_sv_AX', 'goog.i18n.DateTimePatterns_sv_FI', 'goog.i18n.DateTimePatterns_sv_SE', 'goog.i18n.DateTimePatterns_sw_CD', 'goog.i18n.DateTimePatterns_sw_KE', 'goog.i18n.DateTimePatterns_sw_TZ', 'goog.i18n.DateTimePatterns_sw_UG', 'goog.i18n.DateTimePatterns_ta_IN', 'goog.i18n.DateTimePatterns_ta_LK', 'goog.i18n.DateTimePatterns_ta_MY', 'goog.i18n.DateTimePatterns_ta_SG', 'goog.i18n.DateTimePatterns_te_IN', 'goog.i18n.DateTimePatterns_teo', 'goog.i18n.DateTimePatterns_teo_KE', 'goog.i18n.DateTimePatterns_teo_UG', 'goog.i18n.DateTimePatterns_th_TH', 'goog.i18n.DateTimePatterns_ti', 'goog.i18n.DateTimePatterns_ti_ER', 'goog.i18n.DateTimePatterns_ti_ET', 'goog.i18n.DateTimePatterns_to', 'goog.i18n.DateTimePatterns_to_TO', 'goog.i18n.DateTimePatterns_tr_CY', 'goog.i18n.DateTimePatterns_tr_TR', 'goog.i18n.DateTimePatterns_twq', 'goog.i18n.DateTimePatterns_twq_NE', 'goog.i18n.DateTimePatterns_tzm', 'goog.i18n.DateTimePatterns_tzm_Latn', 'goog.i18n.DateTimePatterns_tzm_Latn_MA', 'goog.i18n.DateTimePatterns_ug', 'goog.i18n.DateTimePatterns_ug_Arab', 'goog.i18n.DateTimePatterns_ug_Arab_CN', 'goog.i18n.DateTimePatterns_uk_UA', 'goog.i18n.DateTimePatterns_ur_IN', 'goog.i18n.DateTimePatterns_ur_PK', 'goog.i18n.DateTimePatterns_uz_Arab', 'goog.i18n.DateTimePatterns_uz_Arab_AF', 'goog.i18n.DateTimePatterns_uz_Cyrl', 'goog.i18n.DateTimePatterns_uz_Cyrl_UZ', 'goog.i18n.DateTimePatterns_uz_Latn', 'goog.i18n.DateTimePatterns_uz_Latn_UZ', 'goog.i18n.DateTimePatterns_vai', 'goog.i18n.DateTimePatterns_vai_Latn', 'goog.i18n.DateTimePatterns_vai_Latn_LR', 'goog.i18n.DateTimePatterns_vai_Vaii', 'goog.i18n.DateTimePatterns_vai_Vaii_LR', 'goog.i18n.DateTimePatterns_vi_VN', 'goog.i18n.DateTimePatterns_vun', 'goog.i18n.DateTimePatterns_vun_TZ', 'goog.i18n.DateTimePatterns_wae', 'goog.i18n.DateTimePatterns_wae_CH', 'goog.i18n.DateTimePatterns_xog', 'goog.i18n.DateTimePatterns_xog_UG', 'goog.i18n.DateTimePatterns_yav', 'goog.i18n.DateTimePatterns_yav_CM', 'goog.i18n.DateTimePatterns_yi', 'goog.i18n.DateTimePatterns_yi_001', 'goog.i18n.DateTimePatterns_yo', 'goog.i18n.DateTimePatterns_yo_BJ', 'goog.i18n.DateTimePatterns_yo_NG', 'goog.i18n.DateTimePatterns_zgh', 'goog.i18n.DateTimePatterns_zgh_MA', 'goog.i18n.DateTimePatterns_zh_Hans', 'goog.i18n.DateTimePatterns_zh_Hans_CN', 'goog.i18n.DateTimePatterns_zh_Hans_HK', 'goog.i18n.DateTimePatterns_zh_Hans_MO', 'goog.i18n.DateTimePatterns_zh_Hans_SG', 'goog.i18n.DateTimePatterns_zh_Hant', 'goog.i18n.DateTimePatterns_zh_Hant_HK', 'goog.i18n.DateTimePatterns_zh_Hant_MO', 'goog.i18n.DateTimePatterns_zh_Hant_TW', 'goog.i18n.DateTimePatterns_zu_ZA'], ['goog.i18n.DateTimePatterns'], false);
goog.addDependency('i18n/datetimesymbols.js', ['goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_af', 'goog.i18n.DateTimeSymbols_am', 'goog.i18n.DateTimeSymbols_ar', 'goog.i18n.DateTimeSymbols_az', 'goog.i18n.DateTimeSymbols_be', 'goog.i18n.DateTimeSymbols_bg', 'goog.i18n.DateTimeSymbols_bn', 'goog.i18n.DateTimeSymbols_br', 'goog.i18n.DateTimeSymbols_bs', 'goog.i18n.DateTimeSymbols_ca', 'goog.i18n.DateTimeSymbols_chr', 'goog.i18n.DateTimeSymbols_cs', 'goog.i18n.DateTimeSymbols_cy', 'goog.i18n.DateTimeSymbols_da', 'goog.i18n.DateTimeSymbols_de', 'goog.i18n.DateTimeSymbols_de_AT', 'goog.i18n.DateTimeSymbols_de_CH', 'goog.i18n.DateTimeSymbols_el', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_en_AU', 'goog.i18n.DateTimeSymbols_en_CA', 'goog.i18n.DateTimeSymbols_en_GB', 'goog.i18n.DateTimeSymbols_en_IE', 'goog.i18n.DateTimeSymbols_en_IN', 'goog.i18n.DateTimeSymbols_en_ISO', 'goog.i18n.DateTimeSymbols_en_SG', 'goog.i18n.DateTimeSymbols_en_US', 'goog.i18n.DateTimeSymbols_en_ZA', 'goog.i18n.DateTimeSymbols_es', 'goog.i18n.DateTimeSymbols_es_419', 'goog.i18n.DateTimeSymbols_es_ES', 'goog.i18n.DateTimeSymbols_es_MX', 'goog.i18n.DateTimeSymbols_es_US', 'goog.i18n.DateTimeSymbols_et', 'goog.i18n.DateTimeSymbols_eu', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.DateTimeSymbols_fi', 'goog.i18n.DateTimeSymbols_fil', 'goog.i18n.DateTimeSymbols_fr', 'goog.i18n.DateTimeSymbols_fr_CA', 'goog.i18n.DateTimeSymbols_ga', 'goog.i18n.DateTimeSymbols_gl', 'goog.i18n.DateTimeSymbols_gsw', 'goog.i18n.DateTimeSymbols_gu', 'goog.i18n.DateTimeSymbols_haw', 'goog.i18n.DateTimeSymbols_he', 'goog.i18n.DateTimeSymbols_hi', 'goog.i18n.DateTimeSymbols_hr', 'goog.i18n.DateTimeSymbols_hu', 'goog.i18n.DateTimeSymbols_hy', 'goog.i18n.DateTimeSymbols_id', 'goog.i18n.DateTimeSymbols_in', 'goog.i18n.DateTimeSymbols_is', 'goog.i18n.DateTimeSymbols_it', 'goog.i18n.DateTimeSymbols_iw', 'goog.i18n.DateTimeSymbols_ja', 'goog.i18n.DateTimeSymbols_ka', 'goog.i18n.DateTimeSymbols_kk', 'goog.i18n.DateTimeSymbols_km', 'goog.i18n.DateTimeSymbols_kn', 'goog.i18n.DateTimeSymbols_ko', 'goog.i18n.DateTimeSymbols_ky', 'goog.i18n.DateTimeSymbols_ln', 'goog.i18n.DateTimeSymbols_lo', 'goog.i18n.DateTimeSymbols_lt', 'goog.i18n.DateTimeSymbols_lv', 'goog.i18n.DateTimeSymbols_mk', 'goog.i18n.DateTimeSymbols_ml', 'goog.i18n.DateTimeSymbols_mn', 'goog.i18n.DateTimeSymbols_mr', 'goog.i18n.DateTimeSymbols_ms', 'goog.i18n.DateTimeSymbols_mt', 'goog.i18n.DateTimeSymbols_my', 'goog.i18n.DateTimeSymbols_nb', 'goog.i18n.DateTimeSymbols_ne', 'goog.i18n.DateTimeSymbols_nl', 'goog.i18n.DateTimeSymbols_no', 'goog.i18n.DateTimeSymbols_no_NO', 'goog.i18n.DateTimeSymbols_or', 'goog.i18n.DateTimeSymbols_pa', 'goog.i18n.DateTimeSymbols_pl', 'goog.i18n.DateTimeSymbols_pt', 'goog.i18n.DateTimeSymbols_pt_BR', 'goog.i18n.DateTimeSymbols_pt_PT', 'goog.i18n.DateTimeSymbols_ro', 'goog.i18n.DateTimeSymbols_ru', 'goog.i18n.DateTimeSymbols_si', 'goog.i18n.DateTimeSymbols_sk', 'goog.i18n.DateTimeSymbols_sl', 'goog.i18n.DateTimeSymbols_sq', 'goog.i18n.DateTimeSymbols_sr', 'goog.i18n.DateTimeSymbols_sr_Latn', 'goog.i18n.DateTimeSymbols_sv', 'goog.i18n.DateTimeSymbols_sw', 'goog.i18n.DateTimeSymbols_ta', 'goog.i18n.DateTimeSymbols_te', 'goog.i18n.DateTimeSymbols_th', 'goog.i18n.DateTimeSymbols_tl', 'goog.i18n.DateTimeSymbols_tr', 'goog.i18n.DateTimeSymbols_uk', 'goog.i18n.DateTimeSymbols_ur', 'goog.i18n.DateTimeSymbols_uz', 'goog.i18n.DateTimeSymbols_vi', 'goog.i18n.DateTimeSymbols_zh', 'goog.i18n.DateTimeSymbols_zh_CN', 'goog.i18n.DateTimeSymbols_zh_HK', 'goog.i18n.DateTimeSymbols_zh_TW', 'goog.i18n.DateTimeSymbols_zu'], [], false);
goog.addDependency('i18n/datetimesymbolsext.js', ['goog.i18n.DateTimeSymbolsExt', 'goog.i18n.DateTimeSymbols_af_NA', 'goog.i18n.DateTimeSymbols_af_ZA', 'goog.i18n.DateTimeSymbols_agq', 'goog.i18n.DateTimeSymbols_agq_CM', 'goog.i18n.DateTimeSymbols_ak', 'goog.i18n.DateTimeSymbols_ak_GH', 'goog.i18n.DateTimeSymbols_am_ET', 'goog.i18n.DateTimeSymbols_ar_001', 'goog.i18n.DateTimeSymbols_ar_AE', 'goog.i18n.DateTimeSymbols_ar_BH', 'goog.i18n.DateTimeSymbols_ar_DJ', 'goog.i18n.DateTimeSymbols_ar_DZ', 'goog.i18n.DateTimeSymbols_ar_EG', 'goog.i18n.DateTimeSymbols_ar_EH', 'goog.i18n.DateTimeSymbols_ar_ER', 'goog.i18n.DateTimeSymbols_ar_IL', 'goog.i18n.DateTimeSymbols_ar_IQ', 'goog.i18n.DateTimeSymbols_ar_JO', 'goog.i18n.DateTimeSymbols_ar_KM', 'goog.i18n.DateTimeSymbols_ar_KW', 'goog.i18n.DateTimeSymbols_ar_LB', 'goog.i18n.DateTimeSymbols_ar_LY', 'goog.i18n.DateTimeSymbols_ar_MA', 'goog.i18n.DateTimeSymbols_ar_MR', 'goog.i18n.DateTimeSymbols_ar_OM', 'goog.i18n.DateTimeSymbols_ar_PS', 'goog.i18n.DateTimeSymbols_ar_QA', 'goog.i18n.DateTimeSymbols_ar_SA', 'goog.i18n.DateTimeSymbols_ar_SD', 'goog.i18n.DateTimeSymbols_ar_SO', 'goog.i18n.DateTimeSymbols_ar_SS', 'goog.i18n.DateTimeSymbols_ar_SY', 'goog.i18n.DateTimeSymbols_ar_TD', 'goog.i18n.DateTimeSymbols_ar_TN', 'goog.i18n.DateTimeSymbols_ar_YE', 'goog.i18n.DateTimeSymbols_as', 'goog.i18n.DateTimeSymbols_as_IN', 'goog.i18n.DateTimeSymbols_asa', 'goog.i18n.DateTimeSymbols_asa_TZ', 'goog.i18n.DateTimeSymbols_ast', 'goog.i18n.DateTimeSymbols_ast_ES', 'goog.i18n.DateTimeSymbols_az_Cyrl', 'goog.i18n.DateTimeSymbols_az_Cyrl_AZ', 'goog.i18n.DateTimeSymbols_az_Latn', 'goog.i18n.DateTimeSymbols_az_Latn_AZ', 'goog.i18n.DateTimeSymbols_bas', 'goog.i18n.DateTimeSymbols_bas_CM', 'goog.i18n.DateTimeSymbols_be_BY', 'goog.i18n.DateTimeSymbols_bem', 'goog.i18n.DateTimeSymbols_bem_ZM', 'goog.i18n.DateTimeSymbols_bez', 'goog.i18n.DateTimeSymbols_bez_TZ', 'goog.i18n.DateTimeSymbols_bg_BG', 'goog.i18n.DateTimeSymbols_bm', 'goog.i18n.DateTimeSymbols_bm_Latn', 'goog.i18n.DateTimeSymbols_bm_Latn_ML', 'goog.i18n.DateTimeSymbols_bn_BD', 'goog.i18n.DateTimeSymbols_bn_IN', 'goog.i18n.DateTimeSymbols_bo', 'goog.i18n.DateTimeSymbols_bo_CN', 'goog.i18n.DateTimeSymbols_bo_IN', 'goog.i18n.DateTimeSymbols_br_FR', 'goog.i18n.DateTimeSymbols_brx', 'goog.i18n.DateTimeSymbols_brx_IN', 'goog.i18n.DateTimeSymbols_bs_Cyrl', 'goog.i18n.DateTimeSymbols_bs_Cyrl_BA', 'goog.i18n.DateTimeSymbols_bs_Latn', 'goog.i18n.DateTimeSymbols_bs_Latn_BA', 'goog.i18n.DateTimeSymbols_ca_AD', 'goog.i18n.DateTimeSymbols_ca_ES', 'goog.i18n.DateTimeSymbols_ca_ES_VALENCIA', 'goog.i18n.DateTimeSymbols_ca_FR', 'goog.i18n.DateTimeSymbols_ca_IT', 'goog.i18n.DateTimeSymbols_cgg', 'goog.i18n.DateTimeSymbols_cgg_UG', 'goog.i18n.DateTimeSymbols_chr_US', 'goog.i18n.DateTimeSymbols_ckb', 'goog.i18n.DateTimeSymbols_ckb_Arab', 'goog.i18n.DateTimeSymbols_ckb_Arab_IQ', 'goog.i18n.DateTimeSymbols_ckb_Arab_IR', 'goog.i18n.DateTimeSymbols_ckb_IQ', 'goog.i18n.DateTimeSymbols_ckb_IR', 'goog.i18n.DateTimeSymbols_ckb_Latn', 'goog.i18n.DateTimeSymbols_ckb_Latn_IQ', 'goog.i18n.DateTimeSymbols_cs_CZ', 'goog.i18n.DateTimeSymbols_cy_GB', 'goog.i18n.DateTimeSymbols_da_DK', 'goog.i18n.DateTimeSymbols_da_GL', 'goog.i18n.DateTimeSymbols_dav', 'goog.i18n.DateTimeSymbols_dav_KE', 'goog.i18n.DateTimeSymbols_de_BE', 'goog.i18n.DateTimeSymbols_de_DE', 'goog.i18n.DateTimeSymbols_de_LI', 'goog.i18n.DateTimeSymbols_de_LU', 'goog.i18n.DateTimeSymbols_dje', 'goog.i18n.DateTimeSymbols_dje_NE', 'goog.i18n.DateTimeSymbols_dsb', 'goog.i18n.DateTimeSymbols_dsb_DE', 'goog.i18n.DateTimeSymbols_dua', 'goog.i18n.DateTimeSymbols_dua_CM', 'goog.i18n.DateTimeSymbols_dyo', 'goog.i18n.DateTimeSymbols_dyo_SN', 'goog.i18n.DateTimeSymbols_dz', 'goog.i18n.DateTimeSymbols_dz_BT', 'goog.i18n.DateTimeSymbols_ebu', 'goog.i18n.DateTimeSymbols_ebu_KE', 'goog.i18n.DateTimeSymbols_ee', 'goog.i18n.DateTimeSymbols_ee_GH', 'goog.i18n.DateTimeSymbols_ee_TG', 'goog.i18n.DateTimeSymbols_el_CY', 'goog.i18n.DateTimeSymbols_el_GR', 'goog.i18n.DateTimeSymbols_en_001', 'goog.i18n.DateTimeSymbols_en_150', 'goog.i18n.DateTimeSymbols_en_AG', 'goog.i18n.DateTimeSymbols_en_AI', 'goog.i18n.DateTimeSymbols_en_AS', 'goog.i18n.DateTimeSymbols_en_BB', 'goog.i18n.DateTimeSymbols_en_BE', 'goog.i18n.DateTimeSymbols_en_BM', 'goog.i18n.DateTimeSymbols_en_BS', 'goog.i18n.DateTimeSymbols_en_BW', 'goog.i18n.DateTimeSymbols_en_BZ', 'goog.i18n.DateTimeSymbols_en_CC', 'goog.i18n.DateTimeSymbols_en_CK', 'goog.i18n.DateTimeSymbols_en_CM', 'goog.i18n.DateTimeSymbols_en_CX', 'goog.i18n.DateTimeSymbols_en_DG', 'goog.i18n.DateTimeSymbols_en_DM', 'goog.i18n.DateTimeSymbols_en_ER', 'goog.i18n.DateTimeSymbols_en_FJ', 'goog.i18n.DateTimeSymbols_en_FK', 'goog.i18n.DateTimeSymbols_en_FM', 'goog.i18n.DateTimeSymbols_en_GD', 'goog.i18n.DateTimeSymbols_en_GG', 'goog.i18n.DateTimeSymbols_en_GH', 'goog.i18n.DateTimeSymbols_en_GI', 'goog.i18n.DateTimeSymbols_en_GM', 'goog.i18n.DateTimeSymbols_en_GU', 'goog.i18n.DateTimeSymbols_en_GY', 'goog.i18n.DateTimeSymbols_en_HK', 'goog.i18n.DateTimeSymbols_en_IM', 'goog.i18n.DateTimeSymbols_en_IO', 'goog.i18n.DateTimeSymbols_en_JE', 'goog.i18n.DateTimeSymbols_en_JM', 'goog.i18n.DateTimeSymbols_en_KE', 'goog.i18n.DateTimeSymbols_en_KI', 'goog.i18n.DateTimeSymbols_en_KN', 'goog.i18n.DateTimeSymbols_en_KY', 'goog.i18n.DateTimeSymbols_en_LC', 'goog.i18n.DateTimeSymbols_en_LR', 'goog.i18n.DateTimeSymbols_en_LS', 'goog.i18n.DateTimeSymbols_en_MG', 'goog.i18n.DateTimeSymbols_en_MH', 'goog.i18n.DateTimeSymbols_en_MO', 'goog.i18n.DateTimeSymbols_en_MP', 'goog.i18n.DateTimeSymbols_en_MS', 'goog.i18n.DateTimeSymbols_en_MT', 'goog.i18n.DateTimeSymbols_en_MU', 'goog.i18n.DateTimeSymbols_en_MW', 'goog.i18n.DateTimeSymbols_en_MY', 'goog.i18n.DateTimeSymbols_en_NA', 'goog.i18n.DateTimeSymbols_en_NF', 'goog.i18n.DateTimeSymbols_en_NG', 'goog.i18n.DateTimeSymbols_en_NR', 'goog.i18n.DateTimeSymbols_en_NU', 'goog.i18n.DateTimeSymbols_en_NZ', 'goog.i18n.DateTimeSymbols_en_PG', 'goog.i18n.DateTimeSymbols_en_PH', 'goog.i18n.DateTimeSymbols_en_PK', 'goog.i18n.DateTimeSymbols_en_PN', 'goog.i18n.DateTimeSymbols_en_PR', 'goog.i18n.DateTimeSymbols_en_PW', 'goog.i18n.DateTimeSymbols_en_RW', 'goog.i18n.DateTimeSymbols_en_SB', 'goog.i18n.DateTimeSymbols_en_SC', 'goog.i18n.DateTimeSymbols_en_SD', 'goog.i18n.DateTimeSymbols_en_SH', 'goog.i18n.DateTimeSymbols_en_SL', 'goog.i18n.DateTimeSymbols_en_SS', 'goog.i18n.DateTimeSymbols_en_SX', 'goog.i18n.DateTimeSymbols_en_SZ', 'goog.i18n.DateTimeSymbols_en_TC', 'goog.i18n.DateTimeSymbols_en_TK', 'goog.i18n.DateTimeSymbols_en_TO', 'goog.i18n.DateTimeSymbols_en_TT', 'goog.i18n.DateTimeSymbols_en_TV', 'goog.i18n.DateTimeSymbols_en_TZ', 'goog.i18n.DateTimeSymbols_en_UG', 'goog.i18n.DateTimeSymbols_en_UM', 'goog.i18n.DateTimeSymbols_en_VC', 'goog.i18n.DateTimeSymbols_en_VG', 'goog.i18n.DateTimeSymbols_en_VI', 'goog.i18n.DateTimeSymbols_en_VU', 'goog.i18n.DateTimeSymbols_en_WS', 'goog.i18n.DateTimeSymbols_en_ZM', 'goog.i18n.DateTimeSymbols_en_ZW', 'goog.i18n.DateTimeSymbols_eo', 'goog.i18n.DateTimeSymbols_eo_001', 'goog.i18n.DateTimeSymbols_es_AR', 'goog.i18n.DateTimeSymbols_es_BO', 'goog.i18n.DateTimeSymbols_es_CL', 'goog.i18n.DateTimeSymbols_es_CO', 'goog.i18n.DateTimeSymbols_es_CR', 'goog.i18n.DateTimeSymbols_es_CU', 'goog.i18n.DateTimeSymbols_es_DO', 'goog.i18n.DateTimeSymbols_es_EA', 'goog.i18n.DateTimeSymbols_es_EC', 'goog.i18n.DateTimeSymbols_es_GQ', 'goog.i18n.DateTimeSymbols_es_GT', 'goog.i18n.DateTimeSymbols_es_HN', 'goog.i18n.DateTimeSymbols_es_IC', 'goog.i18n.DateTimeSymbols_es_NI', 'goog.i18n.DateTimeSymbols_es_PA', 'goog.i18n.DateTimeSymbols_es_PE', 'goog.i18n.DateTimeSymbols_es_PH', 'goog.i18n.DateTimeSymbols_es_PR', 'goog.i18n.DateTimeSymbols_es_PY', 'goog.i18n.DateTimeSymbols_es_SV', 'goog.i18n.DateTimeSymbols_es_UY', 'goog.i18n.DateTimeSymbols_es_VE', 'goog.i18n.DateTimeSymbols_et_EE', 'goog.i18n.DateTimeSymbols_eu_ES', 'goog.i18n.DateTimeSymbols_ewo', 'goog.i18n.DateTimeSymbols_ewo_CM', 'goog.i18n.DateTimeSymbols_fa_AF', 'goog.i18n.DateTimeSymbols_fa_IR', 'goog.i18n.DateTimeSymbols_ff', 'goog.i18n.DateTimeSymbols_ff_CM', 'goog.i18n.DateTimeSymbols_ff_GN', 'goog.i18n.DateTimeSymbols_ff_MR', 'goog.i18n.DateTimeSymbols_ff_SN', 'goog.i18n.DateTimeSymbols_fi_FI', 'goog.i18n.DateTimeSymbols_fil_PH', 'goog.i18n.DateTimeSymbols_fo', 'goog.i18n.DateTimeSymbols_fo_FO', 'goog.i18n.DateTimeSymbols_fr_BE', 'goog.i18n.DateTimeSymbols_fr_BF', 'goog.i18n.DateTimeSymbols_fr_BI', 'goog.i18n.DateTimeSymbols_fr_BJ', 'goog.i18n.DateTimeSymbols_fr_BL', 'goog.i18n.DateTimeSymbols_fr_CD', 'goog.i18n.DateTimeSymbols_fr_CF', 'goog.i18n.DateTimeSymbols_fr_CG', 'goog.i18n.DateTimeSymbols_fr_CH', 'goog.i18n.DateTimeSymbols_fr_CI', 'goog.i18n.DateTimeSymbols_fr_CM', 'goog.i18n.DateTimeSymbols_fr_DJ', 'goog.i18n.DateTimeSymbols_fr_DZ', 'goog.i18n.DateTimeSymbols_fr_FR', 'goog.i18n.DateTimeSymbols_fr_GA', 'goog.i18n.DateTimeSymbols_fr_GF', 'goog.i18n.DateTimeSymbols_fr_GN', 'goog.i18n.DateTimeSymbols_fr_GP', 'goog.i18n.DateTimeSymbols_fr_GQ', 'goog.i18n.DateTimeSymbols_fr_HT', 'goog.i18n.DateTimeSymbols_fr_KM', 'goog.i18n.DateTimeSymbols_fr_LU', 'goog.i18n.DateTimeSymbols_fr_MA', 'goog.i18n.DateTimeSymbols_fr_MC', 'goog.i18n.DateTimeSymbols_fr_MF', 'goog.i18n.DateTimeSymbols_fr_MG', 'goog.i18n.DateTimeSymbols_fr_ML', 'goog.i18n.DateTimeSymbols_fr_MQ', 'goog.i18n.DateTimeSymbols_fr_MR', 'goog.i18n.DateTimeSymbols_fr_MU', 'goog.i18n.DateTimeSymbols_fr_NC', 'goog.i18n.DateTimeSymbols_fr_NE', 'goog.i18n.DateTimeSymbols_fr_PF', 'goog.i18n.DateTimeSymbols_fr_PM', 'goog.i18n.DateTimeSymbols_fr_RE', 'goog.i18n.DateTimeSymbols_fr_RW', 'goog.i18n.DateTimeSymbols_fr_SC', 'goog.i18n.DateTimeSymbols_fr_SN', 'goog.i18n.DateTimeSymbols_fr_SY', 'goog.i18n.DateTimeSymbols_fr_TD', 'goog.i18n.DateTimeSymbols_fr_TG', 'goog.i18n.DateTimeSymbols_fr_TN', 'goog.i18n.DateTimeSymbols_fr_VU', 'goog.i18n.DateTimeSymbols_fr_WF', 'goog.i18n.DateTimeSymbols_fr_YT', 'goog.i18n.DateTimeSymbols_fur', 'goog.i18n.DateTimeSymbols_fur_IT', 'goog.i18n.DateTimeSymbols_fy', 'goog.i18n.DateTimeSymbols_fy_NL', 'goog.i18n.DateTimeSymbols_ga_IE', 'goog.i18n.DateTimeSymbols_gd', 'goog.i18n.DateTimeSymbols_gd_GB', 'goog.i18n.DateTimeSymbols_gl_ES', 'goog.i18n.DateTimeSymbols_gsw_CH', 'goog.i18n.DateTimeSymbols_gsw_FR', 'goog.i18n.DateTimeSymbols_gsw_LI', 'goog.i18n.DateTimeSymbols_gu_IN', 'goog.i18n.DateTimeSymbols_guz', 'goog.i18n.DateTimeSymbols_guz_KE', 'goog.i18n.DateTimeSymbols_gv', 'goog.i18n.DateTimeSymbols_gv_IM', 'goog.i18n.DateTimeSymbols_ha', 'goog.i18n.DateTimeSymbols_ha_Latn', 'goog.i18n.DateTimeSymbols_ha_Latn_GH', 'goog.i18n.DateTimeSymbols_ha_Latn_NE', 'goog.i18n.DateTimeSymbols_ha_Latn_NG', 'goog.i18n.DateTimeSymbols_haw_US', 'goog.i18n.DateTimeSymbols_he_IL', 'goog.i18n.DateTimeSymbols_hi_IN', 'goog.i18n.DateTimeSymbols_hr_BA', 'goog.i18n.DateTimeSymbols_hr_HR', 'goog.i18n.DateTimeSymbols_hsb', 'goog.i18n.DateTimeSymbols_hsb_DE', 'goog.i18n.DateTimeSymbols_hu_HU', 'goog.i18n.DateTimeSymbols_hy_AM', 'goog.i18n.DateTimeSymbols_id_ID', 'goog.i18n.DateTimeSymbols_ig', 'goog.i18n.DateTimeSymbols_ig_NG', 'goog.i18n.DateTimeSymbols_ii', 'goog.i18n.DateTimeSymbols_ii_CN', 'goog.i18n.DateTimeSymbols_is_IS', 'goog.i18n.DateTimeSymbols_it_CH', 'goog.i18n.DateTimeSymbols_it_IT', 'goog.i18n.DateTimeSymbols_it_SM', 'goog.i18n.DateTimeSymbols_ja_JP', 'goog.i18n.DateTimeSymbols_jgo', 'goog.i18n.DateTimeSymbols_jgo_CM', 'goog.i18n.DateTimeSymbols_jmc', 'goog.i18n.DateTimeSymbols_jmc_TZ', 'goog.i18n.DateTimeSymbols_ka_GE', 'goog.i18n.DateTimeSymbols_kab', 'goog.i18n.DateTimeSymbols_kab_DZ', 'goog.i18n.DateTimeSymbols_kam', 'goog.i18n.DateTimeSymbols_kam_KE', 'goog.i18n.DateTimeSymbols_kde', 'goog.i18n.DateTimeSymbols_kde_TZ', 'goog.i18n.DateTimeSymbols_kea', 'goog.i18n.DateTimeSymbols_kea_CV', 'goog.i18n.DateTimeSymbols_khq', 'goog.i18n.DateTimeSymbols_khq_ML', 'goog.i18n.DateTimeSymbols_ki', 'goog.i18n.DateTimeSymbols_ki_KE', 'goog.i18n.DateTimeSymbols_kk_Cyrl', 'goog.i18n.DateTimeSymbols_kk_Cyrl_KZ', 'goog.i18n.DateTimeSymbols_kkj', 'goog.i18n.DateTimeSymbols_kkj_CM', 'goog.i18n.DateTimeSymbols_kl', 'goog.i18n.DateTimeSymbols_kl_GL', 'goog.i18n.DateTimeSymbols_kln', 'goog.i18n.DateTimeSymbols_kln_KE', 'goog.i18n.DateTimeSymbols_km_KH', 'goog.i18n.DateTimeSymbols_kn_IN', 'goog.i18n.DateTimeSymbols_ko_KP', 'goog.i18n.DateTimeSymbols_ko_KR', 'goog.i18n.DateTimeSymbols_kok', 'goog.i18n.DateTimeSymbols_kok_IN', 'goog.i18n.DateTimeSymbols_ks', 'goog.i18n.DateTimeSymbols_ks_Arab', 'goog.i18n.DateTimeSymbols_ks_Arab_IN', 'goog.i18n.DateTimeSymbols_ksb', 'goog.i18n.DateTimeSymbols_ksb_TZ', 'goog.i18n.DateTimeSymbols_ksf', 'goog.i18n.DateTimeSymbols_ksf_CM', 'goog.i18n.DateTimeSymbols_ksh', 'goog.i18n.DateTimeSymbols_ksh_DE', 'goog.i18n.DateTimeSymbols_kw', 'goog.i18n.DateTimeSymbols_kw_GB', 'goog.i18n.DateTimeSymbols_ky_Cyrl', 'goog.i18n.DateTimeSymbols_ky_Cyrl_KG', 'goog.i18n.DateTimeSymbols_lag', 'goog.i18n.DateTimeSymbols_lag_TZ', 'goog.i18n.DateTimeSymbols_lb', 'goog.i18n.DateTimeSymbols_lb_LU', 'goog.i18n.DateTimeSymbols_lg', 'goog.i18n.DateTimeSymbols_lg_UG', 'goog.i18n.DateTimeSymbols_lkt', 'goog.i18n.DateTimeSymbols_lkt_US', 'goog.i18n.DateTimeSymbols_ln_AO', 'goog.i18n.DateTimeSymbols_ln_CD', 'goog.i18n.DateTimeSymbols_ln_CF', 'goog.i18n.DateTimeSymbols_ln_CG', 'goog.i18n.DateTimeSymbols_lo_LA', 'goog.i18n.DateTimeSymbols_lt_LT', 'goog.i18n.DateTimeSymbols_lu', 'goog.i18n.DateTimeSymbols_lu_CD', 'goog.i18n.DateTimeSymbols_luo', 'goog.i18n.DateTimeSymbols_luo_KE', 'goog.i18n.DateTimeSymbols_luy', 'goog.i18n.DateTimeSymbols_luy_KE', 'goog.i18n.DateTimeSymbols_lv_LV', 'goog.i18n.DateTimeSymbols_mas', 'goog.i18n.DateTimeSymbols_mas_KE', 'goog.i18n.DateTimeSymbols_mas_TZ', 'goog.i18n.DateTimeSymbols_mer', 'goog.i18n.DateTimeSymbols_mer_KE', 'goog.i18n.DateTimeSymbols_mfe', 'goog.i18n.DateTimeSymbols_mfe_MU', 'goog.i18n.DateTimeSymbols_mg', 'goog.i18n.DateTimeSymbols_mg_MG', 'goog.i18n.DateTimeSymbols_mgh', 'goog.i18n.DateTimeSymbols_mgh_MZ', 'goog.i18n.DateTimeSymbols_mgo', 'goog.i18n.DateTimeSymbols_mgo_CM', 'goog.i18n.DateTimeSymbols_mk_MK', 'goog.i18n.DateTimeSymbols_ml_IN', 'goog.i18n.DateTimeSymbols_mn_Cyrl', 'goog.i18n.DateTimeSymbols_mn_Cyrl_MN', 'goog.i18n.DateTimeSymbols_mr_IN', 'goog.i18n.DateTimeSymbols_ms_Latn', 'goog.i18n.DateTimeSymbols_ms_Latn_BN', 'goog.i18n.DateTimeSymbols_ms_Latn_MY', 'goog.i18n.DateTimeSymbols_ms_Latn_SG', 'goog.i18n.DateTimeSymbols_mt_MT', 'goog.i18n.DateTimeSymbols_mua', 'goog.i18n.DateTimeSymbols_mua_CM', 'goog.i18n.DateTimeSymbols_my_MM', 'goog.i18n.DateTimeSymbols_naq', 'goog.i18n.DateTimeSymbols_naq_NA', 'goog.i18n.DateTimeSymbols_nb_NO', 'goog.i18n.DateTimeSymbols_nb_SJ', 'goog.i18n.DateTimeSymbols_nd', 'goog.i18n.DateTimeSymbols_nd_ZW', 'goog.i18n.DateTimeSymbols_ne_IN', 'goog.i18n.DateTimeSymbols_ne_NP', 'goog.i18n.DateTimeSymbols_nl_AW', 'goog.i18n.DateTimeSymbols_nl_BE', 'goog.i18n.DateTimeSymbols_nl_BQ', 'goog.i18n.DateTimeSymbols_nl_CW', 'goog.i18n.DateTimeSymbols_nl_NL', 'goog.i18n.DateTimeSymbols_nl_SR', 'goog.i18n.DateTimeSymbols_nl_SX', 'goog.i18n.DateTimeSymbols_nmg', 'goog.i18n.DateTimeSymbols_nmg_CM', 'goog.i18n.DateTimeSymbols_nn', 'goog.i18n.DateTimeSymbols_nn_NO', 'goog.i18n.DateTimeSymbols_nnh', 'goog.i18n.DateTimeSymbols_nnh_CM', 'goog.i18n.DateTimeSymbols_nus', 'goog.i18n.DateTimeSymbols_nus_SD', 'goog.i18n.DateTimeSymbols_nyn', 'goog.i18n.DateTimeSymbols_nyn_UG', 'goog.i18n.DateTimeSymbols_om', 'goog.i18n.DateTimeSymbols_om_ET', 'goog.i18n.DateTimeSymbols_om_KE', 'goog.i18n.DateTimeSymbols_or_IN', 'goog.i18n.DateTimeSymbols_os', 'goog.i18n.DateTimeSymbols_os_GE', 'goog.i18n.DateTimeSymbols_os_RU', 'goog.i18n.DateTimeSymbols_pa_Arab', 'goog.i18n.DateTimeSymbols_pa_Arab_PK', 'goog.i18n.DateTimeSymbols_pa_Guru', 'goog.i18n.DateTimeSymbols_pa_Guru_IN', 'goog.i18n.DateTimeSymbols_pl_PL', 'goog.i18n.DateTimeSymbols_ps', 'goog.i18n.DateTimeSymbols_ps_AF', 'goog.i18n.DateTimeSymbols_pt_AO', 'goog.i18n.DateTimeSymbols_pt_CV', 'goog.i18n.DateTimeSymbols_pt_GW', 'goog.i18n.DateTimeSymbols_pt_MO', 'goog.i18n.DateTimeSymbols_pt_MZ', 'goog.i18n.DateTimeSymbols_pt_ST', 'goog.i18n.DateTimeSymbols_pt_TL', 'goog.i18n.DateTimeSymbols_qu', 'goog.i18n.DateTimeSymbols_qu_BO', 'goog.i18n.DateTimeSymbols_qu_EC', 'goog.i18n.DateTimeSymbols_qu_PE', 'goog.i18n.DateTimeSymbols_rm', 'goog.i18n.DateTimeSymbols_rm_CH', 'goog.i18n.DateTimeSymbols_rn', 'goog.i18n.DateTimeSymbols_rn_BI', 'goog.i18n.DateTimeSymbols_ro_MD', 'goog.i18n.DateTimeSymbols_ro_RO', 'goog.i18n.DateTimeSymbols_rof', 'goog.i18n.DateTimeSymbols_rof_TZ', 'goog.i18n.DateTimeSymbols_ru_BY', 'goog.i18n.DateTimeSymbols_ru_KG', 'goog.i18n.DateTimeSymbols_ru_KZ', 'goog.i18n.DateTimeSymbols_ru_MD', 'goog.i18n.DateTimeSymbols_ru_RU', 'goog.i18n.DateTimeSymbols_ru_UA', 'goog.i18n.DateTimeSymbols_rw', 'goog.i18n.DateTimeSymbols_rw_RW', 'goog.i18n.DateTimeSymbols_rwk', 'goog.i18n.DateTimeSymbols_rwk_TZ', 'goog.i18n.DateTimeSymbols_sah', 'goog.i18n.DateTimeSymbols_sah_RU', 'goog.i18n.DateTimeSymbols_saq', 'goog.i18n.DateTimeSymbols_saq_KE', 'goog.i18n.DateTimeSymbols_sbp', 'goog.i18n.DateTimeSymbols_sbp_TZ', 'goog.i18n.DateTimeSymbols_se', 'goog.i18n.DateTimeSymbols_se_FI', 'goog.i18n.DateTimeSymbols_se_NO', 'goog.i18n.DateTimeSymbols_se_SE', 'goog.i18n.DateTimeSymbols_seh', 'goog.i18n.DateTimeSymbols_seh_MZ', 'goog.i18n.DateTimeSymbols_ses', 'goog.i18n.DateTimeSymbols_ses_ML', 'goog.i18n.DateTimeSymbols_sg', 'goog.i18n.DateTimeSymbols_sg_CF', 'goog.i18n.DateTimeSymbols_shi', 'goog.i18n.DateTimeSymbols_shi_Latn', 'goog.i18n.DateTimeSymbols_shi_Latn_MA', 'goog.i18n.DateTimeSymbols_shi_Tfng', 'goog.i18n.DateTimeSymbols_shi_Tfng_MA', 'goog.i18n.DateTimeSymbols_si_LK', 'goog.i18n.DateTimeSymbols_sk_SK', 'goog.i18n.DateTimeSymbols_sl_SI', 'goog.i18n.DateTimeSymbols_smn', 'goog.i18n.DateTimeSymbols_smn_FI', 'goog.i18n.DateTimeSymbols_sn', 'goog.i18n.DateTimeSymbols_sn_ZW', 'goog.i18n.DateTimeSymbols_so', 'goog.i18n.DateTimeSymbols_so_DJ', 'goog.i18n.DateTimeSymbols_so_ET', 'goog.i18n.DateTimeSymbols_so_KE', 'goog.i18n.DateTimeSymbols_so_SO', 'goog.i18n.DateTimeSymbols_sq_AL', 'goog.i18n.DateTimeSymbols_sq_MK', 'goog.i18n.DateTimeSymbols_sq_XK', 'goog.i18n.DateTimeSymbols_sr_Cyrl', 'goog.i18n.DateTimeSymbols_sr_Cyrl_BA', 'goog.i18n.DateTimeSymbols_sr_Cyrl_ME', 'goog.i18n.DateTimeSymbols_sr_Cyrl_RS', 'goog.i18n.DateTimeSymbols_sr_Cyrl_XK', 'goog.i18n.DateTimeSymbols_sr_Latn_BA', 'goog.i18n.DateTimeSymbols_sr_Latn_ME', 'goog.i18n.DateTimeSymbols_sr_Latn_RS', 'goog.i18n.DateTimeSymbols_sr_Latn_XK', 'goog.i18n.DateTimeSymbols_sv_AX', 'goog.i18n.DateTimeSymbols_sv_FI', 'goog.i18n.DateTimeSymbols_sv_SE', 'goog.i18n.DateTimeSymbols_sw_CD', 'goog.i18n.DateTimeSymbols_sw_KE', 'goog.i18n.DateTimeSymbols_sw_TZ', 'goog.i18n.DateTimeSymbols_sw_UG', 'goog.i18n.DateTimeSymbols_ta_IN', 'goog.i18n.DateTimeSymbols_ta_LK', 'goog.i18n.DateTimeSymbols_ta_MY', 'goog.i18n.DateTimeSymbols_ta_SG', 'goog.i18n.DateTimeSymbols_te_IN', 'goog.i18n.DateTimeSymbols_teo', 'goog.i18n.DateTimeSymbols_teo_KE', 'goog.i18n.DateTimeSymbols_teo_UG', 'goog.i18n.DateTimeSymbols_th_TH', 'goog.i18n.DateTimeSymbols_ti', 'goog.i18n.DateTimeSymbols_ti_ER', 'goog.i18n.DateTimeSymbols_ti_ET', 'goog.i18n.DateTimeSymbols_to', 'goog.i18n.DateTimeSymbols_to_TO', 'goog.i18n.DateTimeSymbols_tr_CY', 'goog.i18n.DateTimeSymbols_tr_TR', 'goog.i18n.DateTimeSymbols_twq', 'goog.i18n.DateTimeSymbols_twq_NE', 'goog.i18n.DateTimeSymbols_tzm', 'goog.i18n.DateTimeSymbols_tzm_Latn', 'goog.i18n.DateTimeSymbols_tzm_Latn_MA', 'goog.i18n.DateTimeSymbols_ug', 'goog.i18n.DateTimeSymbols_ug_Arab', 'goog.i18n.DateTimeSymbols_ug_Arab_CN', 'goog.i18n.DateTimeSymbols_uk_UA', 'goog.i18n.DateTimeSymbols_ur_IN', 'goog.i18n.DateTimeSymbols_ur_PK', 'goog.i18n.DateTimeSymbols_uz_Arab', 'goog.i18n.DateTimeSymbols_uz_Arab_AF', 'goog.i18n.DateTimeSymbols_uz_Cyrl', 'goog.i18n.DateTimeSymbols_uz_Cyrl_UZ', 'goog.i18n.DateTimeSymbols_uz_Latn', 'goog.i18n.DateTimeSymbols_uz_Latn_UZ', 'goog.i18n.DateTimeSymbols_vai', 'goog.i18n.DateTimeSymbols_vai_Latn', 'goog.i18n.DateTimeSymbols_vai_Latn_LR', 'goog.i18n.DateTimeSymbols_vai_Vaii', 'goog.i18n.DateTimeSymbols_vai_Vaii_LR', 'goog.i18n.DateTimeSymbols_vi_VN', 'goog.i18n.DateTimeSymbols_vun', 'goog.i18n.DateTimeSymbols_vun_TZ', 'goog.i18n.DateTimeSymbols_wae', 'goog.i18n.DateTimeSymbols_wae_CH', 'goog.i18n.DateTimeSymbols_xog', 'goog.i18n.DateTimeSymbols_xog_UG', 'goog.i18n.DateTimeSymbols_yav', 'goog.i18n.DateTimeSymbols_yav_CM', 'goog.i18n.DateTimeSymbols_yi', 'goog.i18n.DateTimeSymbols_yi_001', 'goog.i18n.DateTimeSymbols_yo', 'goog.i18n.DateTimeSymbols_yo_BJ', 'goog.i18n.DateTimeSymbols_yo_NG', 'goog.i18n.DateTimeSymbols_zgh', 'goog.i18n.DateTimeSymbols_zgh_MA', 'goog.i18n.DateTimeSymbols_zh_Hans', 'goog.i18n.DateTimeSymbols_zh_Hans_CN', 'goog.i18n.DateTimeSymbols_zh_Hans_HK', 'goog.i18n.DateTimeSymbols_zh_Hans_MO', 'goog.i18n.DateTimeSymbols_zh_Hans_SG', 'goog.i18n.DateTimeSymbols_zh_Hant', 'goog.i18n.DateTimeSymbols_zh_Hant_HK', 'goog.i18n.DateTimeSymbols_zh_Hant_MO', 'goog.i18n.DateTimeSymbols_zh_Hant_TW', 'goog.i18n.DateTimeSymbols_zu_ZA'], ['goog.i18n.DateTimeSymbols'], false);
goog.addDependency('i18n/graphemebreak.js', ['goog.i18n.GraphemeBreak'], ['goog.structs.InversionMap'], false);
goog.addDependency('i18n/graphemebreak_test.js', ['goog.i18n.GraphemeBreakTest'], ['goog.i18n.GraphemeBreak', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/messageformat.js', ['goog.i18n.MessageFormat'], ['goog.asserts', 'goog.i18n.NumberFormat', 'goog.i18n.ordinalRules', 'goog.i18n.pluralRules'], false);
goog.addDependency('i18n/messageformat_test.js', ['goog.i18n.MessageFormatTest'], ['goog.i18n.MessageFormat', 'goog.i18n.NumberFormatSymbols_hr', 'goog.i18n.pluralRules', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/mime.js', ['goog.i18n.mime', 'goog.i18n.mime.encode'], ['goog.array'], false);
goog.addDependency('i18n/mime_test.js', ['goog.i18n.mime.encodeTest'], ['goog.i18n.mime.encode', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/numberformat.js', ['goog.i18n.NumberFormat', 'goog.i18n.NumberFormat.CurrencyStyle', 'goog.i18n.NumberFormat.Format'], ['goog.asserts', 'goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.NumberFormatSymbols', 'goog.i18n.currency', 'goog.math'], false);
goog.addDependency('i18n/numberformat_test.js', ['goog.i18n.NumberFormatTest'], ['goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.CompactNumberFormatSymbols_de', 'goog.i18n.CompactNumberFormatSymbols_en', 'goog.i18n.CompactNumberFormatSymbols_fr', 'goog.i18n.NumberFormat', 'goog.i18n.NumberFormatSymbols', 'goog.i18n.NumberFormatSymbols_de', 'goog.i18n.NumberFormatSymbols_en', 'goog.i18n.NumberFormatSymbols_fr', 'goog.i18n.NumberFormatSymbols_pl', 'goog.i18n.NumberFormatSymbols_ro', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('i18n/numberformatsymbols.js', ['goog.i18n.NumberFormatSymbols', 'goog.i18n.NumberFormatSymbols_af', 'goog.i18n.NumberFormatSymbols_af_ZA', 'goog.i18n.NumberFormatSymbols_am', 'goog.i18n.NumberFormatSymbols_am_ET', 'goog.i18n.NumberFormatSymbols_ar', 'goog.i18n.NumberFormatSymbols_ar_001', 'goog.i18n.NumberFormatSymbols_ar_EG', 'goog.i18n.NumberFormatSymbols_az', 'goog.i18n.NumberFormatSymbols_az_Latn', 'goog.i18n.NumberFormatSymbols_az_Latn_AZ', 'goog.i18n.NumberFormatSymbols_be', 'goog.i18n.NumberFormatSymbols_be_BY', 'goog.i18n.NumberFormatSymbols_bg', 'goog.i18n.NumberFormatSymbols_bg_BG', 'goog.i18n.NumberFormatSymbols_bn', 'goog.i18n.NumberFormatSymbols_bn_BD', 'goog.i18n.NumberFormatSymbols_br', 'goog.i18n.NumberFormatSymbols_br_FR', 'goog.i18n.NumberFormatSymbols_bs', 'goog.i18n.NumberFormatSymbols_bs_Latn', 'goog.i18n.NumberFormatSymbols_bs_Latn_BA', 'goog.i18n.NumberFormatSymbols_ca', 'goog.i18n.NumberFormatSymbols_ca_AD', 'goog.i18n.NumberFormatSymbols_ca_ES', 'goog.i18n.NumberFormatSymbols_ca_ES_VALENCIA', 'goog.i18n.NumberFormatSymbols_ca_FR', 'goog.i18n.NumberFormatSymbols_ca_IT', 'goog.i18n.NumberFormatSymbols_chr', 'goog.i18n.NumberFormatSymbols_chr_US', 'goog.i18n.NumberFormatSymbols_cs', 'goog.i18n.NumberFormatSymbols_cs_CZ', 'goog.i18n.NumberFormatSymbols_cy', 'goog.i18n.NumberFormatSymbols_cy_GB', 'goog.i18n.NumberFormatSymbols_da', 'goog.i18n.NumberFormatSymbols_da_DK', 'goog.i18n.NumberFormatSymbols_da_GL', 'goog.i18n.NumberFormatSymbols_de', 'goog.i18n.NumberFormatSymbols_de_AT', 'goog.i18n.NumberFormatSymbols_de_BE', 'goog.i18n.NumberFormatSymbols_de_CH', 'goog.i18n.NumberFormatSymbols_de_DE', 'goog.i18n.NumberFormatSymbols_de_LU', 'goog.i18n.NumberFormatSymbols_el', 'goog.i18n.NumberFormatSymbols_el_CY', 'goog.i18n.NumberFormatSymbols_el_GR', 'goog.i18n.NumberFormatSymbols_en', 'goog.i18n.NumberFormatSymbols_en_001', 'goog.i18n.NumberFormatSymbols_en_AS', 'goog.i18n.NumberFormatSymbols_en_AU', 'goog.i18n.NumberFormatSymbols_en_CA', 'goog.i18n.NumberFormatSymbols_en_DG', 'goog.i18n.NumberFormatSymbols_en_FM', 'goog.i18n.NumberFormatSymbols_en_GB', 'goog.i18n.NumberFormatSymbols_en_GU', 'goog.i18n.NumberFormatSymbols_en_IE', 'goog.i18n.NumberFormatSymbols_en_IN', 'goog.i18n.NumberFormatSymbols_en_IO', 'goog.i18n.NumberFormatSymbols_en_MH', 'goog.i18n.NumberFormatSymbols_en_MP', 'goog.i18n.NumberFormatSymbols_en_PR', 'goog.i18n.NumberFormatSymbols_en_PW', 'goog.i18n.NumberFormatSymbols_en_SG', 'goog.i18n.NumberFormatSymbols_en_TC', 'goog.i18n.NumberFormatSymbols_en_UM', 'goog.i18n.NumberFormatSymbols_en_US', 'goog.i18n.NumberFormatSymbols_en_VG', 'goog.i18n.NumberFormatSymbols_en_VI', 'goog.i18n.NumberFormatSymbols_en_ZA', 'goog.i18n.NumberFormatSymbols_en_ZW', 'goog.i18n.NumberFormatSymbols_es', 'goog.i18n.NumberFormatSymbols_es_419', 'goog.i18n.NumberFormatSymbols_es_EA', 'goog.i18n.NumberFormatSymbols_es_ES', 'goog.i18n.NumberFormatSymbols_es_IC', 'goog.i18n.NumberFormatSymbols_es_MX', 'goog.i18n.NumberFormatSymbols_es_US', 'goog.i18n.NumberFormatSymbols_et', 'goog.i18n.NumberFormatSymbols_et_EE', 'goog.i18n.NumberFormatSymbols_eu', 'goog.i18n.NumberFormatSymbols_eu_ES', 'goog.i18n.NumberFormatSymbols_fa', 'goog.i18n.NumberFormatSymbols_fa_IR', 'goog.i18n.NumberFormatSymbols_fi', 'goog.i18n.NumberFormatSymbols_fi_FI', 'goog.i18n.NumberFormatSymbols_fil', 'goog.i18n.NumberFormatSymbols_fil_PH', 'goog.i18n.NumberFormatSymbols_fr', 'goog.i18n.NumberFormatSymbols_fr_BL', 'goog.i18n.NumberFormatSymbols_fr_CA', 'goog.i18n.NumberFormatSymbols_fr_FR', 'goog.i18n.NumberFormatSymbols_fr_GF', 'goog.i18n.NumberFormatSymbols_fr_GP', 'goog.i18n.NumberFormatSymbols_fr_MC', 'goog.i18n.NumberFormatSymbols_fr_MF', 'goog.i18n.NumberFormatSymbols_fr_MQ', 'goog.i18n.NumberFormatSymbols_fr_PM', 'goog.i18n.NumberFormatSymbols_fr_RE', 'goog.i18n.NumberFormatSymbols_fr_YT', 'goog.i18n.NumberFormatSymbols_ga', 'goog.i18n.NumberFormatSymbols_ga_IE', 'goog.i18n.NumberFormatSymbols_gl', 'goog.i18n.NumberFormatSymbols_gl_ES', 'goog.i18n.NumberFormatSymbols_gsw', 'goog.i18n.NumberFormatSymbols_gsw_CH', 'goog.i18n.NumberFormatSymbols_gsw_LI', 'goog.i18n.NumberFormatSymbols_gu', 'goog.i18n.NumberFormatSymbols_gu_IN', 'goog.i18n.NumberFormatSymbols_haw', 'goog.i18n.NumberFormatSymbols_haw_US', 'goog.i18n.NumberFormatSymbols_he', 'goog.i18n.NumberFormatSymbols_he_IL', 'goog.i18n.NumberFormatSymbols_hi', 'goog.i18n.NumberFormatSymbols_hi_IN', 'goog.i18n.NumberFormatSymbols_hr', 'goog.i18n.NumberFormatSymbols_hr_HR', 'goog.i18n.NumberFormatSymbols_hu', 'goog.i18n.NumberFormatSymbols_hu_HU', 'goog.i18n.NumberFormatSymbols_hy', 'goog.i18n.NumberFormatSymbols_hy_AM', 'goog.i18n.NumberFormatSymbols_id', 'goog.i18n.NumberFormatSymbols_id_ID', 'goog.i18n.NumberFormatSymbols_in', 'goog.i18n.NumberFormatSymbols_is', 'goog.i18n.NumberFormatSymbols_is_IS', 'goog.i18n.NumberFormatSymbols_it', 'goog.i18n.NumberFormatSymbols_it_IT', 'goog.i18n.NumberFormatSymbols_it_SM', 'goog.i18n.NumberFormatSymbols_iw', 'goog.i18n.NumberFormatSymbols_ja', 'goog.i18n.NumberFormatSymbols_ja_JP', 'goog.i18n.NumberFormatSymbols_ka', 'goog.i18n.NumberFormatSymbols_ka_GE', 'goog.i18n.NumberFormatSymbols_kk', 'goog.i18n.NumberFormatSymbols_kk_Cyrl', 'goog.i18n.NumberFormatSymbols_kk_Cyrl_KZ', 'goog.i18n.NumberFormatSymbols_km', 'goog.i18n.NumberFormatSymbols_km_KH', 'goog.i18n.NumberFormatSymbols_kn', 'goog.i18n.NumberFormatSymbols_kn_IN', 'goog.i18n.NumberFormatSymbols_ko', 'goog.i18n.NumberFormatSymbols_ko_KR', 'goog.i18n.NumberFormatSymbols_ky', 'goog.i18n.NumberFormatSymbols_ky_Cyrl', 'goog.i18n.NumberFormatSymbols_ky_Cyrl_KG', 'goog.i18n.NumberFormatSymbols_ln', 'goog.i18n.NumberFormatSymbols_ln_CD', 'goog.i18n.NumberFormatSymbols_lo', 'goog.i18n.NumberFormatSymbols_lo_LA', 'goog.i18n.NumberFormatSymbols_lt', 'goog.i18n.NumberFormatSymbols_lt_LT', 'goog.i18n.NumberFormatSymbols_lv', 'goog.i18n.NumberFormatSymbols_lv_LV', 'goog.i18n.NumberFormatSymbols_mk', 'goog.i18n.NumberFormatSymbols_mk_MK', 'goog.i18n.NumberFormatSymbols_ml', 'goog.i18n.NumberFormatSymbols_ml_IN', 'goog.i18n.NumberFormatSymbols_mn', 'goog.i18n.NumberFormatSymbols_mn_Cyrl', 'goog.i18n.NumberFormatSymbols_mn_Cyrl_MN', 'goog.i18n.NumberFormatSymbols_mr', 'goog.i18n.NumberFormatSymbols_mr_IN', 'goog.i18n.NumberFormatSymbols_ms', 'goog.i18n.NumberFormatSymbols_ms_Latn', 'goog.i18n.NumberFormatSymbols_ms_Latn_MY', 'goog.i18n.NumberFormatSymbols_mt', 'goog.i18n.NumberFormatSymbols_mt_MT', 'goog.i18n.NumberFormatSymbols_my', 'goog.i18n.NumberFormatSymbols_my_MM', 'goog.i18n.NumberFormatSymbols_nb', 'goog.i18n.NumberFormatSymbols_nb_NO', 'goog.i18n.NumberFormatSymbols_nb_SJ', 'goog.i18n.NumberFormatSymbols_ne', 'goog.i18n.NumberFormatSymbols_ne_NP', 'goog.i18n.NumberFormatSymbols_nl', 'goog.i18n.NumberFormatSymbols_nl_NL', 'goog.i18n.NumberFormatSymbols_no', 'goog.i18n.NumberFormatSymbols_no_NO', 'goog.i18n.NumberFormatSymbols_or', 'goog.i18n.NumberFormatSymbols_or_IN', 'goog.i18n.NumberFormatSymbols_pa', 'goog.i18n.NumberFormatSymbols_pa_Guru', 'goog.i18n.NumberFormatSymbols_pa_Guru_IN', 'goog.i18n.NumberFormatSymbols_pl', 'goog.i18n.NumberFormatSymbols_pl_PL', 'goog.i18n.NumberFormatSymbols_pt', 'goog.i18n.NumberFormatSymbols_pt_BR', 'goog.i18n.NumberFormatSymbols_pt_PT', 'goog.i18n.NumberFormatSymbols_ro', 'goog.i18n.NumberFormatSymbols_ro_RO', 'goog.i18n.NumberFormatSymbols_ru', 'goog.i18n.NumberFormatSymbols_ru_RU', 'goog.i18n.NumberFormatSymbols_si', 'goog.i18n.NumberFormatSymbols_si_LK', 'goog.i18n.NumberFormatSymbols_sk', 'goog.i18n.NumberFormatSymbols_sk_SK', 'goog.i18n.NumberFormatSymbols_sl', 'goog.i18n.NumberFormatSymbols_sl_SI', 'goog.i18n.NumberFormatSymbols_sq', 'goog.i18n.NumberFormatSymbols_sq_AL', 'goog.i18n.NumberFormatSymbols_sr', 'goog.i18n.NumberFormatSymbols_sr_Cyrl', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_RS', 'goog.i18n.NumberFormatSymbols_sr_Latn', 'goog.i18n.NumberFormatSymbols_sr_Latn_RS', 'goog.i18n.NumberFormatSymbols_sv', 'goog.i18n.NumberFormatSymbols_sv_SE', 'goog.i18n.NumberFormatSymbols_sw', 'goog.i18n.NumberFormatSymbols_sw_TZ', 'goog.i18n.NumberFormatSymbols_ta', 'goog.i18n.NumberFormatSymbols_ta_IN', 'goog.i18n.NumberFormatSymbols_te', 'goog.i18n.NumberFormatSymbols_te_IN', 'goog.i18n.NumberFormatSymbols_th', 'goog.i18n.NumberFormatSymbols_th_TH', 'goog.i18n.NumberFormatSymbols_tl', 'goog.i18n.NumberFormatSymbols_tr', 'goog.i18n.NumberFormatSymbols_tr_TR', 'goog.i18n.NumberFormatSymbols_uk', 'goog.i18n.NumberFormatSymbols_uk_UA', 'goog.i18n.NumberFormatSymbols_ur', 'goog.i18n.NumberFormatSymbols_ur_PK', 'goog.i18n.NumberFormatSymbols_uz', 'goog.i18n.NumberFormatSymbols_uz_Latn', 'goog.i18n.NumberFormatSymbols_uz_Latn_UZ', 'goog.i18n.NumberFormatSymbols_vi', 'goog.i18n.NumberFormatSymbols_vi_VN', 'goog.i18n.NumberFormatSymbols_zh', 'goog.i18n.NumberFormatSymbols_zh_CN', 'goog.i18n.NumberFormatSymbols_zh_HK', 'goog.i18n.NumberFormatSymbols_zh_Hans', 'goog.i18n.NumberFormatSymbols_zh_Hans_CN', 'goog.i18n.NumberFormatSymbols_zh_TW', 'goog.i18n.NumberFormatSymbols_zu', 'goog.i18n.NumberFormatSymbols_zu_ZA'], [], false);
goog.addDependency('i18n/numberformatsymbolsext.js', ['goog.i18n.NumberFormatSymbolsExt', 'goog.i18n.NumberFormatSymbols_af_NA', 'goog.i18n.NumberFormatSymbols_agq', 'goog.i18n.NumberFormatSymbols_agq_CM', 'goog.i18n.NumberFormatSymbols_ak', 'goog.i18n.NumberFormatSymbols_ak_GH', 'goog.i18n.NumberFormatSymbols_ar_AE', 'goog.i18n.NumberFormatSymbols_ar_BH', 'goog.i18n.NumberFormatSymbols_ar_DJ', 'goog.i18n.NumberFormatSymbols_ar_DZ', 'goog.i18n.NumberFormatSymbols_ar_EH', 'goog.i18n.NumberFormatSymbols_ar_ER', 'goog.i18n.NumberFormatSymbols_ar_IL', 'goog.i18n.NumberFormatSymbols_ar_IQ', 'goog.i18n.NumberFormatSymbols_ar_JO', 'goog.i18n.NumberFormatSymbols_ar_KM', 'goog.i18n.NumberFormatSymbols_ar_KW', 'goog.i18n.NumberFormatSymbols_ar_LB', 'goog.i18n.NumberFormatSymbols_ar_LY', 'goog.i18n.NumberFormatSymbols_ar_MA', 'goog.i18n.NumberFormatSymbols_ar_MR', 'goog.i18n.NumberFormatSymbols_ar_OM', 'goog.i18n.NumberFormatSymbols_ar_PS', 'goog.i18n.NumberFormatSymbols_ar_QA', 'goog.i18n.NumberFormatSymbols_ar_SA', 'goog.i18n.NumberFormatSymbols_ar_SD', 'goog.i18n.NumberFormatSymbols_ar_SO', 'goog.i18n.NumberFormatSymbols_ar_SS', 'goog.i18n.NumberFormatSymbols_ar_SY', 'goog.i18n.NumberFormatSymbols_ar_TD', 'goog.i18n.NumberFormatSymbols_ar_TN', 'goog.i18n.NumberFormatSymbols_ar_YE', 'goog.i18n.NumberFormatSymbols_as', 'goog.i18n.NumberFormatSymbols_as_IN', 'goog.i18n.NumberFormatSymbols_asa', 'goog.i18n.NumberFormatSymbols_asa_TZ', 'goog.i18n.NumberFormatSymbols_ast', 'goog.i18n.NumberFormatSymbols_ast_ES', 'goog.i18n.NumberFormatSymbols_az_Cyrl', 'goog.i18n.NumberFormatSymbols_az_Cyrl_AZ', 'goog.i18n.NumberFormatSymbols_bas', 'goog.i18n.NumberFormatSymbols_bas_CM', 'goog.i18n.NumberFormatSymbols_bem', 'goog.i18n.NumberFormatSymbols_bem_ZM', 'goog.i18n.NumberFormatSymbols_bez', 'goog.i18n.NumberFormatSymbols_bez_TZ', 'goog.i18n.NumberFormatSymbols_bm', 'goog.i18n.NumberFormatSymbols_bm_Latn', 'goog.i18n.NumberFormatSymbols_bm_Latn_ML', 'goog.i18n.NumberFormatSymbols_bn_IN', 'goog.i18n.NumberFormatSymbols_bo', 'goog.i18n.NumberFormatSymbols_bo_CN', 'goog.i18n.NumberFormatSymbols_bo_IN', 'goog.i18n.NumberFormatSymbols_brx', 'goog.i18n.NumberFormatSymbols_brx_IN', 'goog.i18n.NumberFormatSymbols_bs_Cyrl', 'goog.i18n.NumberFormatSymbols_bs_Cyrl_BA', 'goog.i18n.NumberFormatSymbols_cgg', 'goog.i18n.NumberFormatSymbols_cgg_UG', 'goog.i18n.NumberFormatSymbols_ckb', 'goog.i18n.NumberFormatSymbols_ckb_Arab', 'goog.i18n.NumberFormatSymbols_ckb_Arab_IQ', 'goog.i18n.NumberFormatSymbols_ckb_Arab_IR', 'goog.i18n.NumberFormatSymbols_ckb_IQ', 'goog.i18n.NumberFormatSymbols_ckb_IR', 'goog.i18n.NumberFormatSymbols_ckb_Latn', 'goog.i18n.NumberFormatSymbols_ckb_Latn_IQ', 'goog.i18n.NumberFormatSymbols_dav', 'goog.i18n.NumberFormatSymbols_dav_KE', 'goog.i18n.NumberFormatSymbols_de_LI', 'goog.i18n.NumberFormatSymbols_dje', 'goog.i18n.NumberFormatSymbols_dje_NE', 'goog.i18n.NumberFormatSymbols_dsb', 'goog.i18n.NumberFormatSymbols_dsb_DE', 'goog.i18n.NumberFormatSymbols_dua', 'goog.i18n.NumberFormatSymbols_dua_CM', 'goog.i18n.NumberFormatSymbols_dyo', 'goog.i18n.NumberFormatSymbols_dyo_SN', 'goog.i18n.NumberFormatSymbols_dz', 'goog.i18n.NumberFormatSymbols_dz_BT', 'goog.i18n.NumberFormatSymbols_ebu', 'goog.i18n.NumberFormatSymbols_ebu_KE', 'goog.i18n.NumberFormatSymbols_ee', 'goog.i18n.NumberFormatSymbols_ee_GH', 'goog.i18n.NumberFormatSymbols_ee_TG', 'goog.i18n.NumberFormatSymbols_en_150', 'goog.i18n.NumberFormatSymbols_en_AG', 'goog.i18n.NumberFormatSymbols_en_AI', 'goog.i18n.NumberFormatSymbols_en_BB', 'goog.i18n.NumberFormatSymbols_en_BE', 'goog.i18n.NumberFormatSymbols_en_BM', 'goog.i18n.NumberFormatSymbols_en_BS', 'goog.i18n.NumberFormatSymbols_en_BW', 'goog.i18n.NumberFormatSymbols_en_BZ', 'goog.i18n.NumberFormatSymbols_en_CC', 'goog.i18n.NumberFormatSymbols_en_CK', 'goog.i18n.NumberFormatSymbols_en_CM', 'goog.i18n.NumberFormatSymbols_en_CX', 'goog.i18n.NumberFormatSymbols_en_DM', 'goog.i18n.NumberFormatSymbols_en_ER', 'goog.i18n.NumberFormatSymbols_en_FJ', 'goog.i18n.NumberFormatSymbols_en_FK', 'goog.i18n.NumberFormatSymbols_en_GD', 'goog.i18n.NumberFormatSymbols_en_GG', 'goog.i18n.NumberFormatSymbols_en_GH', 'goog.i18n.NumberFormatSymbols_en_GI', 'goog.i18n.NumberFormatSymbols_en_GM', 'goog.i18n.NumberFormatSymbols_en_GY', 'goog.i18n.NumberFormatSymbols_en_HK', 'goog.i18n.NumberFormatSymbols_en_IM', 'goog.i18n.NumberFormatSymbols_en_JE', 'goog.i18n.NumberFormatSymbols_en_JM', 'goog.i18n.NumberFormatSymbols_en_KE', 'goog.i18n.NumberFormatSymbols_en_KI', 'goog.i18n.NumberFormatSymbols_en_KN', 'goog.i18n.NumberFormatSymbols_en_KY', 'goog.i18n.NumberFormatSymbols_en_LC', 'goog.i18n.NumberFormatSymbols_en_LR', 'goog.i18n.NumberFormatSymbols_en_LS', 'goog.i18n.NumberFormatSymbols_en_MG', 'goog.i18n.NumberFormatSymbols_en_MO', 'goog.i18n.NumberFormatSymbols_en_MS', 'goog.i18n.NumberFormatSymbols_en_MT', 'goog.i18n.NumberFormatSymbols_en_MU', 'goog.i18n.NumberFormatSymbols_en_MW', 'goog.i18n.NumberFormatSymbols_en_MY', 'goog.i18n.NumberFormatSymbols_en_NA', 'goog.i18n.NumberFormatSymbols_en_NF', 'goog.i18n.NumberFormatSymbols_en_NG', 'goog.i18n.NumberFormatSymbols_en_NR', 'goog.i18n.NumberFormatSymbols_en_NU', 'goog.i18n.NumberFormatSymbols_en_NZ', 'goog.i18n.NumberFormatSymbols_en_PG', 'goog.i18n.NumberFormatSymbols_en_PH', 'goog.i18n.NumberFormatSymbols_en_PK', 'goog.i18n.NumberFormatSymbols_en_PN', 'goog.i18n.NumberFormatSymbols_en_RW', 'goog.i18n.NumberFormatSymbols_en_SB', 'goog.i18n.NumberFormatSymbols_en_SC', 'goog.i18n.NumberFormatSymbols_en_SD', 'goog.i18n.NumberFormatSymbols_en_SH', 'goog.i18n.NumberFormatSymbols_en_SL', 'goog.i18n.NumberFormatSymbols_en_SS', 'goog.i18n.NumberFormatSymbols_en_SX', 'goog.i18n.NumberFormatSymbols_en_SZ', 'goog.i18n.NumberFormatSymbols_en_TK', 'goog.i18n.NumberFormatSymbols_en_TO', 'goog.i18n.NumberFormatSymbols_en_TT', 'goog.i18n.NumberFormatSymbols_en_TV', 'goog.i18n.NumberFormatSymbols_en_TZ', 'goog.i18n.NumberFormatSymbols_en_UG', 'goog.i18n.NumberFormatSymbols_en_VC', 'goog.i18n.NumberFormatSymbols_en_VU', 'goog.i18n.NumberFormatSymbols_en_WS', 'goog.i18n.NumberFormatSymbols_en_ZM', 'goog.i18n.NumberFormatSymbols_eo', 'goog.i18n.NumberFormatSymbols_eo_001', 'goog.i18n.NumberFormatSymbols_es_AR', 'goog.i18n.NumberFormatSymbols_es_BO', 'goog.i18n.NumberFormatSymbols_es_CL', 'goog.i18n.NumberFormatSymbols_es_CO', 'goog.i18n.NumberFormatSymbols_es_CR', 'goog.i18n.NumberFormatSymbols_es_CU', 'goog.i18n.NumberFormatSymbols_es_DO', 'goog.i18n.NumberFormatSymbols_es_EC', 'goog.i18n.NumberFormatSymbols_es_GQ', 'goog.i18n.NumberFormatSymbols_es_GT', 'goog.i18n.NumberFormatSymbols_es_HN', 'goog.i18n.NumberFormatSymbols_es_NI', 'goog.i18n.NumberFormatSymbols_es_PA', 'goog.i18n.NumberFormatSymbols_es_PE', 'goog.i18n.NumberFormatSymbols_es_PH', 'goog.i18n.NumberFormatSymbols_es_PR', 'goog.i18n.NumberFormatSymbols_es_PY', 'goog.i18n.NumberFormatSymbols_es_SV', 'goog.i18n.NumberFormatSymbols_es_UY', 'goog.i18n.NumberFormatSymbols_es_VE', 'goog.i18n.NumberFormatSymbols_ewo', 'goog.i18n.NumberFormatSymbols_ewo_CM', 'goog.i18n.NumberFormatSymbols_fa_AF', 'goog.i18n.NumberFormatSymbols_ff', 'goog.i18n.NumberFormatSymbols_ff_CM', 'goog.i18n.NumberFormatSymbols_ff_GN', 'goog.i18n.NumberFormatSymbols_ff_MR', 'goog.i18n.NumberFormatSymbols_ff_SN', 'goog.i18n.NumberFormatSymbols_fo', 'goog.i18n.NumberFormatSymbols_fo_FO', 'goog.i18n.NumberFormatSymbols_fr_BE', 'goog.i18n.NumberFormatSymbols_fr_BF', 'goog.i18n.NumberFormatSymbols_fr_BI', 'goog.i18n.NumberFormatSymbols_fr_BJ', 'goog.i18n.NumberFormatSymbols_fr_CD', 'goog.i18n.NumberFormatSymbols_fr_CF', 'goog.i18n.NumberFormatSymbols_fr_CG', 'goog.i18n.NumberFormatSymbols_fr_CH', 'goog.i18n.NumberFormatSymbols_fr_CI', 'goog.i18n.NumberFormatSymbols_fr_CM', 'goog.i18n.NumberFormatSymbols_fr_DJ', 'goog.i18n.NumberFormatSymbols_fr_DZ', 'goog.i18n.NumberFormatSymbols_fr_GA', 'goog.i18n.NumberFormatSymbols_fr_GN', 'goog.i18n.NumberFormatSymbols_fr_GQ', 'goog.i18n.NumberFormatSymbols_fr_HT', 'goog.i18n.NumberFormatSymbols_fr_KM', 'goog.i18n.NumberFormatSymbols_fr_LU', 'goog.i18n.NumberFormatSymbols_fr_MA', 'goog.i18n.NumberFormatSymbols_fr_MG', 'goog.i18n.NumberFormatSymbols_fr_ML', 'goog.i18n.NumberFormatSymbols_fr_MR', 'goog.i18n.NumberFormatSymbols_fr_MU', 'goog.i18n.NumberFormatSymbols_fr_NC', 'goog.i18n.NumberFormatSymbols_fr_NE', 'goog.i18n.NumberFormatSymbols_fr_PF', 'goog.i18n.NumberFormatSymbols_fr_RW', 'goog.i18n.NumberFormatSymbols_fr_SC', 'goog.i18n.NumberFormatSymbols_fr_SN', 'goog.i18n.NumberFormatSymbols_fr_SY', 'goog.i18n.NumberFormatSymbols_fr_TD', 'goog.i18n.NumberFormatSymbols_fr_TG', 'goog.i18n.NumberFormatSymbols_fr_TN', 'goog.i18n.NumberFormatSymbols_fr_VU', 'goog.i18n.NumberFormatSymbols_fr_WF', 'goog.i18n.NumberFormatSymbols_fur', 'goog.i18n.NumberFormatSymbols_fur_IT', 'goog.i18n.NumberFormatSymbols_fy', 'goog.i18n.NumberFormatSymbols_fy_NL', 'goog.i18n.NumberFormatSymbols_gd', 'goog.i18n.NumberFormatSymbols_gd_GB', 'goog.i18n.NumberFormatSymbols_gsw_FR', 'goog.i18n.NumberFormatSymbols_guz', 'goog.i18n.NumberFormatSymbols_guz_KE', 'goog.i18n.NumberFormatSymbols_gv', 'goog.i18n.NumberFormatSymbols_gv_IM', 'goog.i18n.NumberFormatSymbols_ha', 'goog.i18n.NumberFormatSymbols_ha_Latn', 'goog.i18n.NumberFormatSymbols_ha_Latn_GH', 'goog.i18n.NumberFormatSymbols_ha_Latn_NE', 'goog.i18n.NumberFormatSymbols_ha_Latn_NG', 'goog.i18n.NumberFormatSymbols_hr_BA', 'goog.i18n.NumberFormatSymbols_hsb', 'goog.i18n.NumberFormatSymbols_hsb_DE', 'goog.i18n.NumberFormatSymbols_ig', 'goog.i18n.NumberFormatSymbols_ig_NG', 'goog.i18n.NumberFormatSymbols_ii', 'goog.i18n.NumberFormatSymbols_ii_CN', 'goog.i18n.NumberFormatSymbols_it_CH', 'goog.i18n.NumberFormatSymbols_jgo', 'goog.i18n.NumberFormatSymbols_jgo_CM', 'goog.i18n.NumberFormatSymbols_jmc', 'goog.i18n.NumberFormatSymbols_jmc_TZ', 'goog.i18n.NumberFormatSymbols_kab', 'goog.i18n.NumberFormatSymbols_kab_DZ', 'goog.i18n.NumberFormatSymbols_kam', 'goog.i18n.NumberFormatSymbols_kam_KE', 'goog.i18n.NumberFormatSymbols_kde', 'goog.i18n.NumberFormatSymbols_kde_TZ', 'goog.i18n.NumberFormatSymbols_kea', 'goog.i18n.NumberFormatSymbols_kea_CV', 'goog.i18n.NumberFormatSymbols_khq', 'goog.i18n.NumberFormatSymbols_khq_ML', 'goog.i18n.NumberFormatSymbols_ki', 'goog.i18n.NumberFormatSymbols_ki_KE', 'goog.i18n.NumberFormatSymbols_kkj', 'goog.i18n.NumberFormatSymbols_kkj_CM', 'goog.i18n.NumberFormatSymbols_kl', 'goog.i18n.NumberFormatSymbols_kl_GL', 'goog.i18n.NumberFormatSymbols_kln', 'goog.i18n.NumberFormatSymbols_kln_KE', 'goog.i18n.NumberFormatSymbols_ko_KP', 'goog.i18n.NumberFormatSymbols_kok', 'goog.i18n.NumberFormatSymbols_kok_IN', 'goog.i18n.NumberFormatSymbols_ks', 'goog.i18n.NumberFormatSymbols_ks_Arab', 'goog.i18n.NumberFormatSymbols_ks_Arab_IN', 'goog.i18n.NumberFormatSymbols_ksb', 'goog.i18n.NumberFormatSymbols_ksb_TZ', 'goog.i18n.NumberFormatSymbols_ksf', 'goog.i18n.NumberFormatSymbols_ksf_CM', 'goog.i18n.NumberFormatSymbols_ksh', 'goog.i18n.NumberFormatSymbols_ksh_DE', 'goog.i18n.NumberFormatSymbols_kw', 'goog.i18n.NumberFormatSymbols_kw_GB', 'goog.i18n.NumberFormatSymbols_lag', 'goog.i18n.NumberFormatSymbols_lag_TZ', 'goog.i18n.NumberFormatSymbols_lb', 'goog.i18n.NumberFormatSymbols_lb_LU', 'goog.i18n.NumberFormatSymbols_lg', 'goog.i18n.NumberFormatSymbols_lg_UG', 'goog.i18n.NumberFormatSymbols_lkt', 'goog.i18n.NumberFormatSymbols_lkt_US', 'goog.i18n.NumberFormatSymbols_ln_AO', 'goog.i18n.NumberFormatSymbols_ln_CF', 'goog.i18n.NumberFormatSymbols_ln_CG', 'goog.i18n.NumberFormatSymbols_lu', 'goog.i18n.NumberFormatSymbols_lu_CD', 'goog.i18n.NumberFormatSymbols_luo', 'goog.i18n.NumberFormatSymbols_luo_KE', 'goog.i18n.NumberFormatSymbols_luy', 'goog.i18n.NumberFormatSymbols_luy_KE', 'goog.i18n.NumberFormatSymbols_mas', 'goog.i18n.NumberFormatSymbols_mas_KE', 'goog.i18n.NumberFormatSymbols_mas_TZ', 'goog.i18n.NumberFormatSymbols_mer', 'goog.i18n.NumberFormatSymbols_mer_KE', 'goog.i18n.NumberFormatSymbols_mfe', 'goog.i18n.NumberFormatSymbols_mfe_MU', 'goog.i18n.NumberFormatSymbols_mg', 'goog.i18n.NumberFormatSymbols_mg_MG', 'goog.i18n.NumberFormatSymbols_mgh', 'goog.i18n.NumberFormatSymbols_mgh_MZ', 'goog.i18n.NumberFormatSymbols_mgo', 'goog.i18n.NumberFormatSymbols_mgo_CM', 'goog.i18n.NumberFormatSymbols_ms_Latn_BN', 'goog.i18n.NumberFormatSymbols_ms_Latn_SG', 'goog.i18n.NumberFormatSymbols_mua', 'goog.i18n.NumberFormatSymbols_mua_CM', 'goog.i18n.NumberFormatSymbols_naq', 'goog.i18n.NumberFormatSymbols_naq_NA', 'goog.i18n.NumberFormatSymbols_nd', 'goog.i18n.NumberFormatSymbols_nd_ZW', 'goog.i18n.NumberFormatSymbols_ne_IN', 'goog.i18n.NumberFormatSymbols_nl_AW', 'goog.i18n.NumberFormatSymbols_nl_BE', 'goog.i18n.NumberFormatSymbols_nl_BQ', 'goog.i18n.NumberFormatSymbols_nl_CW', 'goog.i18n.NumberFormatSymbols_nl_SR', 'goog.i18n.NumberFormatSymbols_nl_SX', 'goog.i18n.NumberFormatSymbols_nmg', 'goog.i18n.NumberFormatSymbols_nmg_CM', 'goog.i18n.NumberFormatSymbols_nn', 'goog.i18n.NumberFormatSymbols_nn_NO', 'goog.i18n.NumberFormatSymbols_nnh', 'goog.i18n.NumberFormatSymbols_nnh_CM', 'goog.i18n.NumberFormatSymbols_nus', 'goog.i18n.NumberFormatSymbols_nus_SD', 'goog.i18n.NumberFormatSymbols_nyn', 'goog.i18n.NumberFormatSymbols_nyn_UG', 'goog.i18n.NumberFormatSymbols_om', 'goog.i18n.NumberFormatSymbols_om_ET', 'goog.i18n.NumberFormatSymbols_om_KE', 'goog.i18n.NumberFormatSymbols_os', 'goog.i18n.NumberFormatSymbols_os_GE', 'goog.i18n.NumberFormatSymbols_os_RU', 'goog.i18n.NumberFormatSymbols_pa_Arab', 'goog.i18n.NumberFormatSymbols_pa_Arab_PK', 'goog.i18n.NumberFormatSymbols_ps', 'goog.i18n.NumberFormatSymbols_ps_AF', 'goog.i18n.NumberFormatSymbols_pt_AO', 'goog.i18n.NumberFormatSymbols_pt_CV', 'goog.i18n.NumberFormatSymbols_pt_GW', 'goog.i18n.NumberFormatSymbols_pt_MO', 'goog.i18n.NumberFormatSymbols_pt_MZ', 'goog.i18n.NumberFormatSymbols_pt_ST', 'goog.i18n.NumberFormatSymbols_pt_TL', 'goog.i18n.NumberFormatSymbols_qu', 'goog.i18n.NumberFormatSymbols_qu_BO', 'goog.i18n.NumberFormatSymbols_qu_EC', 'goog.i18n.NumberFormatSymbols_qu_PE', 'goog.i18n.NumberFormatSymbols_rm', 'goog.i18n.NumberFormatSymbols_rm_CH', 'goog.i18n.NumberFormatSymbols_rn', 'goog.i18n.NumberFormatSymbols_rn_BI', 'goog.i18n.NumberFormatSymbols_ro_MD', 'goog.i18n.NumberFormatSymbols_rof', 'goog.i18n.NumberFormatSymbols_rof_TZ', 'goog.i18n.NumberFormatSymbols_ru_BY', 'goog.i18n.NumberFormatSymbols_ru_KG', 'goog.i18n.NumberFormatSymbols_ru_KZ', 'goog.i18n.NumberFormatSymbols_ru_MD', 'goog.i18n.NumberFormatSymbols_ru_UA', 'goog.i18n.NumberFormatSymbols_rw', 'goog.i18n.NumberFormatSymbols_rw_RW', 'goog.i18n.NumberFormatSymbols_rwk', 'goog.i18n.NumberFormatSymbols_rwk_TZ', 'goog.i18n.NumberFormatSymbols_sah', 'goog.i18n.NumberFormatSymbols_sah_RU', 'goog.i18n.NumberFormatSymbols_saq', 'goog.i18n.NumberFormatSymbols_saq_KE', 'goog.i18n.NumberFormatSymbols_sbp', 'goog.i18n.NumberFormatSymbols_sbp_TZ', 'goog.i18n.NumberFormatSymbols_se', 'goog.i18n.NumberFormatSymbols_se_FI', 'goog.i18n.NumberFormatSymbols_se_NO', 'goog.i18n.NumberFormatSymbols_se_SE', 'goog.i18n.NumberFormatSymbols_seh', 'goog.i18n.NumberFormatSymbols_seh_MZ', 'goog.i18n.NumberFormatSymbols_ses', 'goog.i18n.NumberFormatSymbols_ses_ML', 'goog.i18n.NumberFormatSymbols_sg', 'goog.i18n.NumberFormatSymbols_sg_CF', 'goog.i18n.NumberFormatSymbols_shi', 'goog.i18n.NumberFormatSymbols_shi_Latn', 'goog.i18n.NumberFormatSymbols_shi_Latn_MA', 'goog.i18n.NumberFormatSymbols_shi_Tfng', 'goog.i18n.NumberFormatSymbols_shi_Tfng_MA', 'goog.i18n.NumberFormatSymbols_smn', 'goog.i18n.NumberFormatSymbols_smn_FI', 'goog.i18n.NumberFormatSymbols_sn', 'goog.i18n.NumberFormatSymbols_sn_ZW', 'goog.i18n.NumberFormatSymbols_so', 'goog.i18n.NumberFormatSymbols_so_DJ', 'goog.i18n.NumberFormatSymbols_so_ET', 'goog.i18n.NumberFormatSymbols_so_KE', 'goog.i18n.NumberFormatSymbols_so_SO', 'goog.i18n.NumberFormatSymbols_sq_MK', 'goog.i18n.NumberFormatSymbols_sq_XK', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_BA', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_ME', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_XK', 'goog.i18n.NumberFormatSymbols_sr_Latn_BA', 'goog.i18n.NumberFormatSymbols_sr_Latn_ME', 'goog.i18n.NumberFormatSymbols_sr_Latn_XK', 'goog.i18n.NumberFormatSymbols_sv_AX', 'goog.i18n.NumberFormatSymbols_sv_FI', 'goog.i18n.NumberFormatSymbols_sw_CD', 'goog.i18n.NumberFormatSymbols_sw_KE', 'goog.i18n.NumberFormatSymbols_sw_UG', 'goog.i18n.NumberFormatSymbols_ta_LK', 'goog.i18n.NumberFormatSymbols_ta_MY', 'goog.i18n.NumberFormatSymbols_ta_SG', 'goog.i18n.NumberFormatSymbols_teo', 'goog.i18n.NumberFormatSymbols_teo_KE', 'goog.i18n.NumberFormatSymbols_teo_UG', 'goog.i18n.NumberFormatSymbols_ti', 'goog.i18n.NumberFormatSymbols_ti_ER', 'goog.i18n.NumberFormatSymbols_ti_ET', 'goog.i18n.NumberFormatSymbols_to', 'goog.i18n.NumberFormatSymbols_to_TO', 'goog.i18n.NumberFormatSymbols_tr_CY', 'goog.i18n.NumberFormatSymbols_twq', 'goog.i18n.NumberFormatSymbols_twq_NE', 'goog.i18n.NumberFormatSymbols_tzm', 'goog.i18n.NumberFormatSymbols_tzm_Latn', 'goog.i18n.NumberFormatSymbols_tzm_Latn_MA', 'goog.i18n.NumberFormatSymbols_ug', 'goog.i18n.NumberFormatSymbols_ug_Arab', 'goog.i18n.NumberFormatSymbols_ug_Arab_CN', 'goog.i18n.NumberFormatSymbols_ur_IN', 'goog.i18n.NumberFormatSymbols_uz_Arab', 'goog.i18n.NumberFormatSymbols_uz_Arab_AF', 'goog.i18n.NumberFormatSymbols_uz_Cyrl', 'goog.i18n.NumberFormatSymbols_uz_Cyrl_UZ', 'goog.i18n.NumberFormatSymbols_vai', 'goog.i18n.NumberFormatSymbols_vai_Latn', 'goog.i18n.NumberFormatSymbols_vai_Latn_LR', 'goog.i18n.NumberFormatSymbols_vai_Vaii', 'goog.i18n.NumberFormatSymbols_vai_Vaii_LR', 'goog.i18n.NumberFormatSymbols_vun', 'goog.i18n.NumberFormatSymbols_vun_TZ', 'goog.i18n.NumberFormatSymbols_wae', 'goog.i18n.NumberFormatSymbols_wae_CH', 'goog.i18n.NumberFormatSymbols_xog', 'goog.i18n.NumberFormatSymbols_xog_UG', 'goog.i18n.NumberFormatSymbols_yav', 'goog.i18n.NumberFormatSymbols_yav_CM', 'goog.i18n.NumberFormatSymbols_yi', 'goog.i18n.NumberFormatSymbols_yi_001', 'goog.i18n.NumberFormatSymbols_yo', 'goog.i18n.NumberFormatSymbols_yo_BJ', 'goog.i18n.NumberFormatSymbols_yo_NG', 'goog.i18n.NumberFormatSymbols_zgh', 'goog.i18n.NumberFormatSymbols_zgh_MA', 'goog.i18n.NumberFormatSymbols_zh_Hans_HK', 'goog.i18n.NumberFormatSymbols_zh_Hans_MO', 'goog.i18n.NumberFormatSymbols_zh_Hans_SG', 'goog.i18n.NumberFormatSymbols_zh_Hant', 'goog.i18n.NumberFormatSymbols_zh_Hant_HK', 'goog.i18n.NumberFormatSymbols_zh_Hant_MO', 'goog.i18n.NumberFormatSymbols_zh_Hant_TW'], ['goog.i18n.NumberFormatSymbols'], false);
goog.addDependency('i18n/ordinalrules.js', ['goog.i18n.ordinalRules'], [], false);
goog.addDependency('i18n/pluralrules.js', ['goog.i18n.pluralRules'], [], false);
goog.addDependency('i18n/pluralrules_test.js', ['goog.i18n.pluralRulesTest'], ['goog.i18n.pluralRules', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/timezone.js', ['goog.i18n.TimeZone'], ['goog.array', 'goog.date.DateLike', 'goog.object', 'goog.string'], false);
goog.addDependency('i18n/timezone_test.js', ['goog.i18n.TimeZoneTest'], ['goog.i18n.TimeZone', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/uchar.js', ['goog.i18n.uChar'], [], false);
goog.addDependency('i18n/uchar/localnamefetcher.js', ['goog.i18n.uChar.LocalNameFetcher'], ['goog.i18n.uChar.NameFetcher', 'goog.i18n.uCharNames', 'goog.log'], false);
goog.addDependency('i18n/uchar/localnamefetcher_test.js', ['goog.i18n.uChar.LocalNameFetcherTest'], ['goog.i18n.uChar.LocalNameFetcher', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('i18n/uchar/namefetcher.js', ['goog.i18n.uChar.NameFetcher'], [], false);
goog.addDependency('i18n/uchar/remotenamefetcher.js', ['goog.i18n.uChar.RemoteNameFetcher'], ['goog.Disposable', 'goog.Uri', 'goog.i18n.uChar', 'goog.i18n.uChar.NameFetcher', 'goog.log', 'goog.net.XhrIo', 'goog.structs.Map'], false);
goog.addDependency('i18n/uchar/remotenamefetcher_test.js', ['goog.i18n.uChar.RemoteNameFetcherTest'], ['goog.i18n.uChar.RemoteNameFetcher', 'goog.net.XhrIo', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction'], false);
goog.addDependency('i18n/uchar_test.js', ['goog.i18n.uCharTest'], ['goog.i18n.uChar', 'goog.testing.jsunit'], false);
goog.addDependency('i18n/ucharnames.js', ['goog.i18n.uCharNames'], ['goog.i18n.uChar'], false);
goog.addDependency('i18n/ucharnames_test.js', ['goog.i18n.uCharNamesTest'], ['goog.i18n.uCharNames', 'goog.testing.jsunit'], false);
goog.addDependency('iter/iter.js', ['goog.iter', 'goog.iter.Iterable', 'goog.iter.Iterator', 'goog.iter.StopIteration'], ['goog.array', 'goog.asserts', 'goog.functions', 'goog.math'], false);
goog.addDependency('iter/iter_test.js', ['goog.iterTest'], ['goog.iter', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.testing.jsunit'], false);
goog.addDependency('json/evaljsonprocessor.js', ['goog.json.EvalJsonProcessor'], ['goog.json', 'goog.json.Processor', 'goog.json.Serializer'], false);
goog.addDependency('json/hybrid.js', ['goog.json.hybrid'], ['goog.asserts', 'goog.json'], false);
goog.addDependency('json/hybrid_test.js', ['goog.json.hybridTest'], ['goog.json', 'goog.json.hybrid', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('json/hybridjsonprocessor.js', ['goog.json.HybridJsonProcessor'], ['goog.json.Processor', 'goog.json.hybrid'], false);
goog.addDependency('json/hybridjsonprocessor_test.js', ['goog.json.HybridJsonProcessorTest'], ['goog.json.HybridJsonProcessor', 'goog.json.hybrid', 'goog.testing.jsunit'], false);
goog.addDependency('json/json.js', ['goog.json', 'goog.json.Replacer', 'goog.json.Reviver', 'goog.json.Serializer'], [], false);
goog.addDependency('json/json_perf.js', ['goog.jsonPerf'], ['goog.dom', 'goog.json', 'goog.math', 'goog.string', 'goog.testing.PerformanceTable', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('json/json_test.js', ['goog.jsonTest'], ['goog.functions', 'goog.json', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('json/nativejsonprocessor.js', ['goog.json.NativeJsonProcessor'], ['goog.asserts', 'goog.json.Processor'], false);
goog.addDependency('json/processor.js', ['goog.json.Processor'], ['goog.string.Parser', 'goog.string.Stringifier'], false);
goog.addDependency('json/processor_test.js', ['goog.json.processorTest'], ['goog.json.EvalJsonProcessor', 'goog.json.NativeJsonProcessor', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('labs/dom/pagevisibilitymonitor.js', ['goog.labs.dom.PageVisibilityEvent', 'goog.labs.dom.PageVisibilityMonitor', 'goog.labs.dom.PageVisibilityState'], ['goog.dom', 'goog.dom.vendor', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.memoize'], false);
goog.addDependency('labs/dom/pagevisibilitymonitor_test.js', ['goog.labs.dom.PageVisibilityMonitorTest'], ['goog.events', 'goog.functions', 'goog.labs.dom.PageVisibilityMonitor', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('labs/events/nondisposableeventtarget.js', ['goog.labs.events.NonDisposableEventTarget'], ['goog.array', 'goog.asserts', 'goog.events.Event', 'goog.events.Listenable', 'goog.events.ListenerMap', 'goog.object'], false);
goog.addDependency('labs/events/nondisposableeventtarget_test.js', ['goog.labs.events.NonDisposableEventTargetTest'], ['goog.events.Listenable', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.labs.events.NonDisposableEventTarget', 'goog.testing.jsunit'], false);
goog.addDependency('labs/events/nondisposableeventtarget_via_googevents_test.js', ['goog.labs.events.NonDisposableEventTargetGoogEventsTest'], ['goog.events', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.labs.events.NonDisposableEventTarget', 'goog.testing', 'goog.testing.jsunit'], false);
goog.addDependency('labs/events/touch.js', ['goog.labs.events.touch', 'goog.labs.events.touch.TouchData'], ['goog.array', 'goog.asserts', 'goog.events.EventType', 'goog.string'], false);
goog.addDependency('labs/events/touch_test.js', ['goog.labs.events.touchTest'], ['goog.labs.events.touch', 'goog.testing.jsunit'], false);
goog.addDependency('labs/format/csv.js', ['goog.labs.format.csv', 'goog.labs.format.csv.ParseError', 'goog.labs.format.csv.Token'], ['goog.array', 'goog.asserts', 'goog.debug.Error', 'goog.object', 'goog.string', 'goog.string.newlines'], false);
goog.addDependency('labs/format/csv_test.js', ['goog.labs.format.csvTest'], ['goog.labs.format.csv', 'goog.labs.format.csv.ParseError', 'goog.object', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('labs/html/attribute_rewriter.js', ['goog.labs.html.AttributeRewriter', 'goog.labs.html.AttributeValue', 'goog.labs.html.attributeRewriterPresubmitWorkaround'], [], false);
goog.addDependency('labs/html/sanitizer.js', ['goog.labs.html.Sanitizer'], ['goog.asserts', 'goog.html.SafeUrl', 'goog.labs.html.attributeRewriterPresubmitWorkaround', 'goog.labs.html.scrubber', 'goog.object', 'goog.string'], false);
goog.addDependency('labs/html/sanitizer_test.js', ['goog.labs.html.SanitizerTest'], ['goog.html.SafeUrl', 'goog.labs.html.Sanitizer', 'goog.string', 'goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('labs/html/scrubber.js', ['goog.labs.html.scrubber'], ['goog.array', 'goog.dom.tags', 'goog.labs.html.attributeRewriterPresubmitWorkaround', 'goog.string'], false);
goog.addDependency('labs/html/scrubber_test.js', ['goog.html.ScrubberTest'], ['goog.labs.html.scrubber', 'goog.object', 'goog.string', 'goog.testing.jsunit'], false);
goog.addDependency('labs/i18n/listformat.js', ['goog.labs.i18n.GenderInfo', 'goog.labs.i18n.GenderInfo.Gender', 'goog.labs.i18n.ListFormat'], ['goog.asserts', 'goog.labs.i18n.ListFormatSymbols'], false);
goog.addDependency('labs/i18n/listformat_test.js', ['goog.labs.i18n.ListFormatTest'], ['goog.labs.i18n.GenderInfo', 'goog.labs.i18n.ListFormat', 'goog.labs.i18n.ListFormatSymbols', 'goog.labs.i18n.ListFormatSymbols_el', 'goog.labs.i18n.ListFormatSymbols_en', 'goog.labs.i18n.ListFormatSymbols_fr', 'goog.labs.i18n.ListFormatSymbols_ml', 'goog.labs.i18n.ListFormatSymbols_zu', 'goog.testing.jsunit'], false);
goog.addDependency('labs/i18n/listsymbols.js', ['goog.labs.i18n.ListFormatSymbols', 'goog.labs.i18n.ListFormatSymbols_af', 'goog.labs.i18n.ListFormatSymbols_am', 'goog.labs.i18n.ListFormatSymbols_ar', 'goog.labs.i18n.ListFormatSymbols_az', 'goog.labs.i18n.ListFormatSymbols_be', 'goog.labs.i18n.ListFormatSymbols_bg', 'goog.labs.i18n.ListFormatSymbols_bn', 'goog.labs.i18n.ListFormatSymbols_br', 'goog.labs.i18n.ListFormatSymbols_bs', 'goog.labs.i18n.ListFormatSymbols_ca', 'goog.labs.i18n.ListFormatSymbols_chr', 'goog.labs.i18n.ListFormatSymbols_cs', 'goog.labs.i18n.ListFormatSymbols_cy', 'goog.labs.i18n.ListFormatSymbols_da', 'goog.labs.i18n.ListFormatSymbols_de', 'goog.labs.i18n.ListFormatSymbols_de_AT', 'goog.labs.i18n.ListFormatSymbols_de_CH', 'goog.labs.i18n.ListFormatSymbols_el', 'goog.labs.i18n.ListFormatSymbols_en', 'goog.labs.i18n.ListFormatSymbols_en_AU', 'goog.labs.i18n.ListFormatSymbols_en_CA', 'goog.labs.i18n.ListFormatSymbols_en_GB', 'goog.labs.i18n.ListFormatSymbols_en_IE', 'goog.labs.i18n.ListFormatSymbols_en_IN', 'goog.labs.i18n.ListFormatSymbols_en_SG', 'goog.labs.i18n.ListFormatSymbols_en_US', 'goog.labs.i18n.ListFormatSymbols_en_ZA', 'goog.labs.i18n.ListFormatSymbols_es', 'goog.labs.i18n.ListFormatSymbols_es_419', 'goog.labs.i18n.ListFormatSymbols_es_ES', 'goog.labs.i18n.ListFormatSymbols_es_MX', 'goog.labs.i18n.ListFormatSymbols_es_US', 'goog.labs.i18n.ListFormatSymbols_et', 'goog.labs.i18n.ListFormatSymbols_eu', 'goog.labs.i18n.ListFormatSymbols_fa', 'goog.labs.i18n.ListFormatSymbols_fi', 'goog.labs.i18n.ListFormatSymbols_fil', 'goog.labs.i18n.ListFormatSymbols_fr', 'goog.labs.i18n.ListFormatSymbols_fr_CA', 'goog.labs.i18n.ListFormatSymbols_ga', 'goog.labs.i18n.ListFormatSymbols_gl', 'goog.labs.i18n.ListFormatSymbols_gsw', 'goog.labs.i18n.ListFormatSymbols_gu', 'goog.labs.i18n.ListFormatSymbols_haw', 'goog.labs.i18n.ListFormatSymbols_he', 'goog.labs.i18n.ListFormatSymbols_hi', 'goog.labs.i18n.ListFormatSymbols_hr', 'goog.labs.i18n.ListFormatSymbols_hu', 'goog.labs.i18n.ListFormatSymbols_hy', 'goog.labs.i18n.ListFormatSymbols_id', 'goog.labs.i18n.ListFormatSymbols_in', 'goog.labs.i18n.ListFormatSymbols_is', 'goog.labs.i18n.ListFormatSymbols_it', 'goog.labs.i18n.ListFormatSymbols_iw', 'goog.labs.i18n.ListFormatSymbols_ja', 'goog.labs.i18n.ListFormatSymbols_ka', 'goog.labs.i18n.ListFormatSymbols_kk', 'goog.labs.i18n.ListFormatSymbols_km', 'goog.labs.i18n.ListFormatSymbols_kn', 'goog.labs.i18n.ListFormatSymbols_ko', 'goog.labs.i18n.ListFormatSymbols_ky', 'goog.labs.i18n.ListFormatSymbols_ln', 'goog.labs.i18n.ListFormatSymbols_lo', 'goog.labs.i18n.ListFormatSymbols_lt', 'goog.labs.i18n.ListFormatSymbols_lv', 'goog.labs.i18n.ListFormatSymbols_mk', 'goog.labs.i18n.ListFormatSymbols_ml', 'goog.labs.i18n.ListFormatSymbols_mn', 'goog.labs.i18n.ListFormatSymbols_mo', 'goog.labs.i18n.ListFormatSymbols_mr', 'goog.labs.i18n.ListFormatSymbols_ms', 'goog.labs.i18n.ListFormatSymbols_mt', 'goog.labs.i18n.ListFormatSymbols_my', 'goog.labs.i18n.ListFormatSymbols_nb', 'goog.labs.i18n.ListFormatSymbols_ne', 'goog.labs.i18n.ListFormatSymbols_nl', 'goog.labs.i18n.ListFormatSymbols_no', 'goog.labs.i18n.ListFormatSymbols_no_NO', 'goog.labs.i18n.ListFormatSymbols_or', 'goog.labs.i18n.ListFormatSymbols_pa', 'goog.labs.i18n.ListFormatSymbols_pl', 'goog.labs.i18n.ListFormatSymbols_pt', 'goog.labs.i18n.ListFormatSymbols_pt_BR', 'goog.labs.i18n.ListFormatSymbols_pt_PT', 'goog.labs.i18n.ListFormatSymbols_ro', 'goog.labs.i18n.ListFormatSymbols_ru', 'goog.labs.i18n.ListFormatSymbols_sh', 'goog.labs.i18n.ListFormatSymbols_si', 'goog.labs.i18n.ListFormatSymbols_sk', 'goog.labs.i18n.ListFormatSymbols_sl', 'goog.labs.i18n.ListFormatSymbols_sq', 'goog.labs.i18n.ListFormatSymbols_sr', 'goog.labs.i18n.ListFormatSymbols_sr_Latn', 'goog.labs.i18n.ListFormatSymbols_sv', 'goog.labs.i18n.ListFormatSymbols_sw', 'goog.labs.i18n.ListFormatSymbols_ta', 'goog.labs.i18n.ListFormatSymbols_te', 'goog.labs.i18n.ListFormatSymbols_th', 'goog.labs.i18n.ListFormatSymbols_tl', 'goog.labs.i18n.ListFormatSymbols_tr', 'goog.labs.i18n.ListFormatSymbols_uk', 'goog.labs.i18n.ListFormatSymbols_ur', 'goog.labs.i18n.ListFormatSymbols_uz', 'goog.labs.i18n.ListFormatSymbols_vi', 'goog.labs.i18n.ListFormatSymbols_zh', 'goog.labs.i18n.ListFormatSymbols_zh_CN', 'goog.labs.i18n.ListFormatSymbols_zh_HK', 'goog.labs.i18n.ListFormatSymbols_zh_TW', 'goog.labs.i18n.ListFormatSymbols_zu'], [], false);
goog.addDependency('labs/i18n/listsymbolsext.js', ['goog.labs.i18n.ListFormatSymbolsExt', 'goog.labs.i18n.ListFormatSymbols_af_NA', 'goog.labs.i18n.ListFormatSymbols_af_ZA', 'goog.labs.i18n.ListFormatSymbols_agq', 'goog.labs.i18n.ListFormatSymbols_agq_CM', 'goog.labs.i18n.ListFormatSymbols_ak', 'goog.labs.i18n.ListFormatSymbols_ak_GH', 'goog.labs.i18n.ListFormatSymbols_am_ET', 'goog.labs.i18n.ListFormatSymbols_ar_001', 'goog.labs.i18n.ListFormatSymbols_ar_AE', 'goog.labs.i18n.ListFormatSymbols_ar_BH', 'goog.labs.i18n.ListFormatSymbols_ar_DJ', 'goog.labs.i18n.ListFormatSymbols_ar_DZ', 'goog.labs.i18n.ListFormatSymbols_ar_EG', 'goog.labs.i18n.ListFormatSymbols_ar_EH', 'goog.labs.i18n.ListFormatSymbols_ar_ER', 'goog.labs.i18n.ListFormatSymbols_ar_IL', 'goog.labs.i18n.ListFormatSymbols_ar_IQ', 'goog.labs.i18n.ListFormatSymbols_ar_JO', 'goog.labs.i18n.ListFormatSymbols_ar_KM', 'goog.labs.i18n.ListFormatSymbols_ar_KW', 'goog.labs.i18n.ListFormatSymbols_ar_LB', 'goog.labs.i18n.ListFormatSymbols_ar_LY', 'goog.labs.i18n.ListFormatSymbols_ar_MA', 'goog.labs.i18n.ListFormatSymbols_ar_MR', 'goog.labs.i18n.ListFormatSymbols_ar_OM', 'goog.labs.i18n.ListFormatSymbols_ar_PS', 'goog.labs.i18n.ListFormatSymbols_ar_QA', 'goog.labs.i18n.ListFormatSymbols_ar_SA', 'goog.labs.i18n.ListFormatSymbols_ar_SD', 'goog.labs.i18n.ListFormatSymbols_ar_SO', 'goog.labs.i18n.ListFormatSymbols_ar_SS', 'goog.labs.i18n.ListFormatSymbols_ar_SY', 'goog.labs.i18n.ListFormatSymbols_ar_TD', 'goog.labs.i18n.ListFormatSymbols_ar_TN', 'goog.labs.i18n.ListFormatSymbols_ar_YE', 'goog.labs.i18n.ListFormatSymbols_as', 'goog.labs.i18n.ListFormatSymbols_as_IN', 'goog.labs.i18n.ListFormatSymbols_asa', 'goog.labs.i18n.ListFormatSymbols_asa_TZ', 'goog.labs.i18n.ListFormatSymbols_az_Cyrl', 'goog.labs.i18n.ListFormatSymbols_az_Cyrl_AZ', 'goog.labs.i18n.ListFormatSymbols_az_Latn', 'goog.labs.i18n.ListFormatSymbols_az_Latn_AZ', 'goog.labs.i18n.ListFormatSymbols_bas', 'goog.labs.i18n.ListFormatSymbols_bas_CM', 'goog.labs.i18n.ListFormatSymbols_be_BY', 'goog.labs.i18n.ListFormatSymbols_bem', 'goog.labs.i18n.ListFormatSymbols_bem_ZM', 'goog.labs.i18n.ListFormatSymbols_bez', 'goog.labs.i18n.ListFormatSymbols_bez_TZ', 'goog.labs.i18n.ListFormatSymbols_bg_BG', 'goog.labs.i18n.ListFormatSymbols_bm', 'goog.labs.i18n.ListFormatSymbols_bm_Latn', 'goog.labs.i18n.ListFormatSymbols_bm_Latn_ML', 'goog.labs.i18n.ListFormatSymbols_bn_BD', 'goog.labs.i18n.ListFormatSymbols_bn_IN', 'goog.labs.i18n.ListFormatSymbols_bo', 'goog.labs.i18n.ListFormatSymbols_bo_CN', 'goog.labs.i18n.ListFormatSymbols_bo_IN', 'goog.labs.i18n.ListFormatSymbols_br_FR', 'goog.labs.i18n.ListFormatSymbols_brx', 'goog.labs.i18n.ListFormatSymbols_brx_IN', 'goog.labs.i18n.ListFormatSymbols_bs_Cyrl', 'goog.labs.i18n.ListFormatSymbols_bs_Cyrl_BA', 'goog.labs.i18n.ListFormatSymbols_bs_Latn', 'goog.labs.i18n.ListFormatSymbols_bs_Latn_BA', 'goog.labs.i18n.ListFormatSymbols_ca_AD', 'goog.labs.i18n.ListFormatSymbols_ca_ES', 'goog.labs.i18n.ListFormatSymbols_ca_FR', 'goog.labs.i18n.ListFormatSymbols_ca_IT', 'goog.labs.i18n.ListFormatSymbols_cgg', 'goog.labs.i18n.ListFormatSymbols_cgg_UG', 'goog.labs.i18n.ListFormatSymbols_chr_US', 'goog.labs.i18n.ListFormatSymbols_cs_CZ', 'goog.labs.i18n.ListFormatSymbols_cy_GB', 'goog.labs.i18n.ListFormatSymbols_da_DK', 'goog.labs.i18n.ListFormatSymbols_da_GL', 'goog.labs.i18n.ListFormatSymbols_dav', 'goog.labs.i18n.ListFormatSymbols_dav_KE', 'goog.labs.i18n.ListFormatSymbols_de_BE', 'goog.labs.i18n.ListFormatSymbols_de_DE', 'goog.labs.i18n.ListFormatSymbols_de_LI', 'goog.labs.i18n.ListFormatSymbols_de_LU', 'goog.labs.i18n.ListFormatSymbols_dje', 'goog.labs.i18n.ListFormatSymbols_dje_NE', 'goog.labs.i18n.ListFormatSymbols_dsb', 'goog.labs.i18n.ListFormatSymbols_dsb_DE', 'goog.labs.i18n.ListFormatSymbols_dua', 'goog.labs.i18n.ListFormatSymbols_dua_CM', 'goog.labs.i18n.ListFormatSymbols_dyo', 'goog.labs.i18n.ListFormatSymbols_dyo_SN', 'goog.labs.i18n.ListFormatSymbols_dz', 'goog.labs.i18n.ListFormatSymbols_dz_BT', 'goog.labs.i18n.ListFormatSymbols_ebu', 'goog.labs.i18n.ListFormatSymbols_ebu_KE', 'goog.labs.i18n.ListFormatSymbols_ee', 'goog.labs.i18n.ListFormatSymbols_ee_GH', 'goog.labs.i18n.ListFormatSymbols_ee_TG', 'goog.labs.i18n.ListFormatSymbols_el_CY', 'goog.labs.i18n.ListFormatSymbols_el_GR', 'goog.labs.i18n.ListFormatSymbols_en_001', 'goog.labs.i18n.ListFormatSymbols_en_150', 'goog.labs.i18n.ListFormatSymbols_en_AG', 'goog.labs.i18n.ListFormatSymbols_en_AI', 'goog.labs.i18n.ListFormatSymbols_en_AS', 'goog.labs.i18n.ListFormatSymbols_en_BB', 'goog.labs.i18n.ListFormatSymbols_en_BE', 'goog.labs.i18n.ListFormatSymbols_en_BM', 'goog.labs.i18n.ListFormatSymbols_en_BS', 'goog.labs.i18n.ListFormatSymbols_en_BW', 'goog.labs.i18n.ListFormatSymbols_en_BZ', 'goog.labs.i18n.ListFormatSymbols_en_CC', 'goog.labs.i18n.ListFormatSymbols_en_CK', 'goog.labs.i18n.ListFormatSymbols_en_CM', 'goog.labs.i18n.ListFormatSymbols_en_CX', 'goog.labs.i18n.ListFormatSymbols_en_DG', 'goog.labs.i18n.ListFormatSymbols_en_DM', 'goog.labs.i18n.ListFormatSymbols_en_ER', 'goog.labs.i18n.ListFormatSymbols_en_FJ', 'goog.labs.i18n.ListFormatSymbols_en_FK', 'goog.labs.i18n.ListFormatSymbols_en_FM', 'goog.labs.i18n.ListFormatSymbols_en_GD', 'goog.labs.i18n.ListFormatSymbols_en_GG', 'goog.labs.i18n.ListFormatSymbols_en_GH', 'goog.labs.i18n.ListFormatSymbols_en_GI', 'goog.labs.i18n.ListFormatSymbols_en_GM', 'goog.labs.i18n.ListFormatSymbols_en_GU', 'goog.labs.i18n.ListFormatSymbols_en_GY', 'goog.labs.i18n.ListFormatSymbols_en_HK', 'goog.labs.i18n.ListFormatSymbols_en_IM', 'goog.labs.i18n.ListFormatSymbols_en_IO', 'goog.labs.i18n.ListFormatSymbols_en_JE', 'goog.labs.i18n.ListFormatSymbols_en_JM', 'goog.labs.i18n.ListFormatSymbols_en_KE', 'goog.labs.i18n.ListFormatSymbols_en_KI', 'goog.labs.i18n.ListFormatSymbols_en_KN', 'goog.labs.i18n.ListFormatSymbols_en_KY', 'goog.labs.i18n.ListFormatSymbols_en_LC', 'goog.labs.i18n.ListFormatSymbols_en_LR', 'goog.labs.i18n.ListFormatSymbols_en_LS', 'goog.labs.i18n.ListFormatSymbols_en_MG', 'goog.labs.i18n.ListFormatSymbols_en_MH', 'goog.labs.i18n.ListFormatSymbols_en_MO', 'goog.labs.i18n.ListFormatSymbols_en_MP', 'goog.labs.i18n.ListFormatSymbols_en_MS', 'goog.labs.i18n.ListFormatSymbols_en_MT', 'goog.labs.i18n.ListFormatSymbols_en_MU', 'goog.labs.i18n.ListFormatSymbols_en_MW', 'goog.labs.i18n.ListFormatSymbols_en_MY', 'goog.labs.i18n.ListFormatSymbols_en_NA', 'goog.labs.i18n.ListFormatSymbols_en_NF', 'goog.labs.i18n.ListFormatSymbols_en_NG', 'goog.labs.i18n.ListFormatSymbols_en_NR', 'goog.labs.i18n.ListFormatSymbols_en_NU', 'goog.labs.i18n.ListFormatSymbols_en_NZ', 'goog.labs.i18n.ListFormatSymbols_en_PG', 'goog.labs.i18n.ListFormatSymbols_en_PH', 'goog.labs.i18n.ListFormatSymbols_en_PK', 'goog.labs.i18n.ListFormatSymbols_en_PN', 'goog.labs.i18n.ListFormatSymbols_en_PR', 'goog.labs.i18n.ListFormatSymbols_en_PW', 'goog.labs.i18n.ListFormatSymbols_en_RW', 'goog.labs.i18n.ListFormatSymbols_en_SB', 'goog.labs.i18n.ListFormatSymbols_en_SC', 'goog.labs.i18n.ListFormatSymbols_en_SD', 'goog.labs.i18n.ListFormatSymbols_en_SH', 'goog.labs.i18n.ListFormatSymbols_en_SL', 'goog.labs.i18n.ListFormatSymbols_en_SS', 'goog.labs.i18n.ListFormatSymbols_en_SX', 'goog.labs.i18n.ListFormatSymbols_en_SZ', 'goog.labs.i18n.ListFormatSymbols_en_TC', 'goog.labs.i18n.ListFormatSymbols_en_TK', 'goog.labs.i18n.ListFormatSymbols_en_TO', 'goog.labs.i18n.ListFormatSymbols_en_TT', 'goog.labs.i18n.ListFormatSymbols_en_TV', 'goog.labs.i18n.ListFormatSymbols_en_TZ', 'goog.labs.i18n.ListFormatSymbols_en_UG', 'goog.labs.i18n.ListFormatSymbols_en_UM', 'goog.labs.i18n.ListFormatSymbols_en_US_POSIX', 'goog.labs.i18n.ListFormatSymbols_en_VC', 'goog.labs.i18n.ListFormatSymbols_en_VG', 'goog.labs.i18n.ListFormatSymbols_en_VI', 'goog.labs.i18n.ListFormatSymbols_en_VU', 'goog.labs.i18n.ListFormatSymbols_en_WS', 'goog.labs.i18n.ListFormatSymbols_en_ZM', 'goog.labs.i18n.ListFormatSymbols_en_ZW', 'goog.labs.i18n.ListFormatSymbols_eo', 'goog.labs.i18n.ListFormatSymbols_es_AR', 'goog.labs.i18n.ListFormatSymbols_es_BO', 'goog.labs.i18n.ListFormatSymbols_es_CL', 'goog.labs.i18n.ListFormatSymbols_es_CO', 'goog.labs.i18n.ListFormatSymbols_es_CR', 'goog.labs.i18n.ListFormatSymbols_es_CU', 'goog.labs.i18n.ListFormatSymbols_es_DO', 'goog.labs.i18n.ListFormatSymbols_es_EA', 'goog.labs.i18n.ListFormatSymbols_es_EC', 'goog.labs.i18n.ListFormatSymbols_es_GQ', 'goog.labs.i18n.ListFormatSymbols_es_GT', 'goog.labs.i18n.ListFormatSymbols_es_HN', 'goog.labs.i18n.ListFormatSymbols_es_IC', 'goog.labs.i18n.ListFormatSymbols_es_NI', 'goog.labs.i18n.ListFormatSymbols_es_PA', 'goog.labs.i18n.ListFormatSymbols_es_PE', 'goog.labs.i18n.ListFormatSymbols_es_PH', 'goog.labs.i18n.ListFormatSymbols_es_PR', 'goog.labs.i18n.ListFormatSymbols_es_PY', 'goog.labs.i18n.ListFormatSymbols_es_SV', 'goog.labs.i18n.ListFormatSymbols_es_UY', 'goog.labs.i18n.ListFormatSymbols_es_VE', 'goog.labs.i18n.ListFormatSymbols_et_EE', 'goog.labs.i18n.ListFormatSymbols_eu_ES', 'goog.labs.i18n.ListFormatSymbols_ewo', 'goog.labs.i18n.ListFormatSymbols_ewo_CM', 'goog.labs.i18n.ListFormatSymbols_fa_AF', 'goog.labs.i18n.ListFormatSymbols_fa_IR', 'goog.labs.i18n.ListFormatSymbols_ff', 'goog.labs.i18n.ListFormatSymbols_ff_CM', 'goog.labs.i18n.ListFormatSymbols_ff_GN', 'goog.labs.i18n.ListFormatSymbols_ff_MR', 'goog.labs.i18n.ListFormatSymbols_ff_SN', 'goog.labs.i18n.ListFormatSymbols_fi_FI', 'goog.labs.i18n.ListFormatSymbols_fil_PH', 'goog.labs.i18n.ListFormatSymbols_fo', 'goog.labs.i18n.ListFormatSymbols_fo_FO', 'goog.labs.i18n.ListFormatSymbols_fr_BE', 'goog.labs.i18n.ListFormatSymbols_fr_BF', 'goog.labs.i18n.ListFormatSymbols_fr_BI', 'goog.labs.i18n.ListFormatSymbols_fr_BJ', 'goog.labs.i18n.ListFormatSymbols_fr_BL', 'goog.labs.i18n.ListFormatSymbols_fr_CD', 'goog.labs.i18n.ListFormatSymbols_fr_CF', 'goog.labs.i18n.ListFormatSymbols_fr_CG', 'goog.labs.i18n.ListFormatSymbols_fr_CH', 'goog.labs.i18n.ListFormatSymbols_fr_CI', 'goog.labs.i18n.ListFormatSymbols_fr_CM', 'goog.labs.i18n.ListFormatSymbols_fr_DJ', 'goog.labs.i18n.ListFormatSymbols_fr_DZ', 'goog.labs.i18n.ListFormatSymbols_fr_FR', 'goog.labs.i18n.ListFormatSymbols_fr_GA', 'goog.labs.i18n.ListFormatSymbols_fr_GF', 'goog.labs.i18n.ListFormatSymbols_fr_GN', 'goog.labs.i18n.ListFormatSymbols_fr_GP', 'goog.labs.i18n.ListFormatSymbols_fr_GQ', 'goog.labs.i18n.ListFormatSymbols_fr_HT', 'goog.labs.i18n.ListFormatSymbols_fr_KM', 'goog.labs.i18n.ListFormatSymbols_fr_LU', 'goog.labs.i18n.ListFormatSymbols_fr_MA', 'goog.labs.i18n.ListFormatSymbols_fr_MC', 'goog.labs.i18n.ListFormatSymbols_fr_MF', 'goog.labs.i18n.ListFormatSymbols_fr_MG', 'goog.labs.i18n.ListFormatSymbols_fr_ML', 'goog.labs.i18n.ListFormatSymbols_fr_MQ', 'goog.labs.i18n.ListFormatSymbols_fr_MR', 'goog.labs.i18n.ListFormatSymbols_fr_MU', 'goog.labs.i18n.ListFormatSymbols_fr_NC', 'goog.labs.i18n.ListFormatSymbols_fr_NE', 'goog.labs.i18n.ListFormatSymbols_fr_PF', 'goog.labs.i18n.ListFormatSymbols_fr_PM', 'goog.labs.i18n.ListFormatSymbols_fr_RE', 'goog.labs.i18n.ListFormatSymbols_fr_RW', 'goog.labs.i18n.ListFormatSymbols_fr_SC', 'goog.labs.i18n.ListFormatSymbols_fr_SN', 'goog.labs.i18n.ListFormatSymbols_fr_SY', 'goog.labs.i18n.ListFormatSymbols_fr_TD', 'goog.labs.i18n.ListFormatSymbols_fr_TG', 'goog.labs.i18n.ListFormatSymbols_fr_TN', 'goog.labs.i18n.ListFormatSymbols_fr_VU', 'goog.labs.i18n.ListFormatSymbols_fr_WF', 'goog.labs.i18n.ListFormatSymbols_fr_YT', 'goog.labs.i18n.ListFormatSymbols_fur', 'goog.labs.i18n.ListFormatSymbols_fur_IT', 'goog.labs.i18n.ListFormatSymbols_fy', 'goog.labs.i18n.ListFormatSymbols_fy_NL', 'goog.labs.i18n.ListFormatSymbols_ga_IE', 'goog.labs.i18n.ListFormatSymbols_gd', 'goog.labs.i18n.ListFormatSymbols_gd_GB', 'goog.labs.i18n.ListFormatSymbols_gl_ES', 'goog.labs.i18n.ListFormatSymbols_gsw_CH', 'goog.labs.i18n.ListFormatSymbols_gsw_FR', 'goog.labs.i18n.ListFormatSymbols_gsw_LI', 'goog.labs.i18n.ListFormatSymbols_gu_IN', 'goog.labs.i18n.ListFormatSymbols_guz', 'goog.labs.i18n.ListFormatSymbols_guz_KE', 'goog.labs.i18n.ListFormatSymbols_gv', 'goog.labs.i18n.ListFormatSymbols_gv_IM', 'goog.labs.i18n.ListFormatSymbols_ha', 'goog.labs.i18n.ListFormatSymbols_ha_Latn', 'goog.labs.i18n.ListFormatSymbols_ha_Latn_GH', 'goog.labs.i18n.ListFormatSymbols_ha_Latn_NE', 'goog.labs.i18n.ListFormatSymbols_ha_Latn_NG', 'goog.labs.i18n.ListFormatSymbols_haw_US', 'goog.labs.i18n.ListFormatSymbols_he_IL', 'goog.labs.i18n.ListFormatSymbols_hi_IN', 'goog.labs.i18n.ListFormatSymbols_hr_BA', 'goog.labs.i18n.ListFormatSymbols_hr_HR', 'goog.labs.i18n.ListFormatSymbols_hsb', 'goog.labs.i18n.ListFormatSymbols_hsb_DE', 'goog.labs.i18n.ListFormatSymbols_hu_HU', 'goog.labs.i18n.ListFormatSymbols_hy_AM', 'goog.labs.i18n.ListFormatSymbols_id_ID', 'goog.labs.i18n.ListFormatSymbols_ig', 'goog.labs.i18n.ListFormatSymbols_ig_NG', 'goog.labs.i18n.ListFormatSymbols_ii', 'goog.labs.i18n.ListFormatSymbols_ii_CN', 'goog.labs.i18n.ListFormatSymbols_is_IS', 'goog.labs.i18n.ListFormatSymbols_it_CH', 'goog.labs.i18n.ListFormatSymbols_it_IT', 'goog.labs.i18n.ListFormatSymbols_it_SM', 'goog.labs.i18n.ListFormatSymbols_ja_JP', 'goog.labs.i18n.ListFormatSymbols_jgo', 'goog.labs.i18n.ListFormatSymbols_jgo_CM', 'goog.labs.i18n.ListFormatSymbols_jmc', 'goog.labs.i18n.ListFormatSymbols_jmc_TZ', 'goog.labs.i18n.ListFormatSymbols_ka_GE', 'goog.labs.i18n.ListFormatSymbols_kab', 'goog.labs.i18n.ListFormatSymbols_kab_DZ', 'goog.labs.i18n.ListFormatSymbols_kam', 'goog.labs.i18n.ListFormatSymbols_kam_KE', 'goog.labs.i18n.ListFormatSymbols_kde', 'goog.labs.i18n.ListFormatSymbols_kde_TZ', 'goog.labs.i18n.ListFormatSymbols_kea', 'goog.labs.i18n.ListFormatSymbols_kea_CV', 'goog.labs.i18n.ListFormatSymbols_khq', 'goog.labs.i18n.ListFormatSymbols_khq_ML', 'goog.labs.i18n.ListFormatSymbols_ki', 'goog.labs.i18n.ListFormatSymbols_ki_KE', 'goog.labs.i18n.ListFormatSymbols_kk_Cyrl', 'goog.labs.i18n.ListFormatSymbols_kk_Cyrl_KZ', 'goog.labs.i18n.ListFormatSymbols_kkj', 'goog.labs.i18n.ListFormatSymbols_kkj_CM', 'goog.labs.i18n.ListFormatSymbols_kl', 'goog.labs.i18n.ListFormatSymbols_kl_GL', 'goog.labs.i18n.ListFormatSymbols_kln', 'goog.labs.i18n.ListFormatSymbols_kln_KE', 'goog.labs.i18n.ListFormatSymbols_km_KH', 'goog.labs.i18n.ListFormatSymbols_kn_IN', 'goog.labs.i18n.ListFormatSymbols_ko_KP', 'goog.labs.i18n.ListFormatSymbols_ko_KR', 'goog.labs.i18n.ListFormatSymbols_kok', 'goog.labs.i18n.ListFormatSymbols_kok_IN', 'goog.labs.i18n.ListFormatSymbols_ks', 'goog.labs.i18n.ListFormatSymbols_ks_Arab', 'goog.labs.i18n.ListFormatSymbols_ks_Arab_IN', 'goog.labs.i18n.ListFormatSymbols_ksb', 'goog.labs.i18n.ListFormatSymbols_ksb_TZ', 'goog.labs.i18n.ListFormatSymbols_ksf', 'goog.labs.i18n.ListFormatSymbols_ksf_CM', 'goog.labs.i18n.ListFormatSymbols_ksh', 'goog.labs.i18n.ListFormatSymbols_ksh_DE', 'goog.labs.i18n.ListFormatSymbols_kw', 'goog.labs.i18n.ListFormatSymbols_kw_GB', 'goog.labs.i18n.ListFormatSymbols_ky_Cyrl', 'goog.labs.i18n.ListFormatSymbols_ky_Cyrl_KG', 'goog.labs.i18n.ListFormatSymbols_lag', 'goog.labs.i18n.ListFormatSymbols_lag_TZ', 'goog.labs.i18n.ListFormatSymbols_lb', 'goog.labs.i18n.ListFormatSymbols_lb_LU', 'goog.labs.i18n.ListFormatSymbols_lg', 'goog.labs.i18n.ListFormatSymbols_lg_UG', 'goog.labs.i18n.ListFormatSymbols_lkt', 'goog.labs.i18n.ListFormatSymbols_lkt_US', 'goog.labs.i18n.ListFormatSymbols_ln_AO', 'goog.labs.i18n.ListFormatSymbols_ln_CD', 'goog.labs.i18n.ListFormatSymbols_ln_CF', 'goog.labs.i18n.ListFormatSymbols_ln_CG', 'goog.labs.i18n.ListFormatSymbols_lo_LA', 'goog.labs.i18n.ListFormatSymbols_lt_LT', 'goog.labs.i18n.ListFormatSymbols_lu', 'goog.labs.i18n.ListFormatSymbols_lu_CD', 'goog.labs.i18n.ListFormatSymbols_luo', 'goog.labs.i18n.ListFormatSymbols_luo_KE', 'goog.labs.i18n.ListFormatSymbols_luy', 'goog.labs.i18n.ListFormatSymbols_luy_KE', 'goog.labs.i18n.ListFormatSymbols_lv_LV', 'goog.labs.i18n.ListFormatSymbols_mas', 'goog.labs.i18n.ListFormatSymbols_mas_KE', 'goog.labs.i18n.ListFormatSymbols_mas_TZ', 'goog.labs.i18n.ListFormatSymbols_mer', 'goog.labs.i18n.ListFormatSymbols_mer_KE', 'goog.labs.i18n.ListFormatSymbols_mfe', 'goog.labs.i18n.ListFormatSymbols_mfe_MU', 'goog.labs.i18n.ListFormatSymbols_mg', 'goog.labs.i18n.ListFormatSymbols_mg_MG', 'goog.labs.i18n.ListFormatSymbols_mgh', 'goog.labs.i18n.ListFormatSymbols_mgh_MZ', 'goog.labs.i18n.ListFormatSymbols_mgo', 'goog.labs.i18n.ListFormatSymbols_mgo_CM', 'goog.labs.i18n.ListFormatSymbols_mk_MK', 'goog.labs.i18n.ListFormatSymbols_ml_IN', 'goog.labs.i18n.ListFormatSymbols_mn_Cyrl', 'goog.labs.i18n.ListFormatSymbols_mn_Cyrl_MN', 'goog.labs.i18n.ListFormatSymbols_mr_IN', 'goog.labs.i18n.ListFormatSymbols_ms_Latn', 'goog.labs.i18n.ListFormatSymbols_ms_Latn_BN', 'goog.labs.i18n.ListFormatSymbols_ms_Latn_MY', 'goog.labs.i18n.ListFormatSymbols_ms_Latn_SG', 'goog.labs.i18n.ListFormatSymbols_mt_MT', 'goog.labs.i18n.ListFormatSymbols_mua', 'goog.labs.i18n.ListFormatSymbols_mua_CM', 'goog.labs.i18n.ListFormatSymbols_my_MM', 'goog.labs.i18n.ListFormatSymbols_naq', 'goog.labs.i18n.ListFormatSymbols_naq_NA', 'goog.labs.i18n.ListFormatSymbols_nb_NO', 'goog.labs.i18n.ListFormatSymbols_nb_SJ', 'goog.labs.i18n.ListFormatSymbols_nd', 'goog.labs.i18n.ListFormatSymbols_nd_ZW', 'goog.labs.i18n.ListFormatSymbols_ne_IN', 'goog.labs.i18n.ListFormatSymbols_ne_NP', 'goog.labs.i18n.ListFormatSymbols_nl_AW', 'goog.labs.i18n.ListFormatSymbols_nl_BE', 'goog.labs.i18n.ListFormatSymbols_nl_BQ', 'goog.labs.i18n.ListFormatSymbols_nl_CW', 'goog.labs.i18n.ListFormatSymbols_nl_NL', 'goog.labs.i18n.ListFormatSymbols_nl_SR', 'goog.labs.i18n.ListFormatSymbols_nl_SX', 'goog.labs.i18n.ListFormatSymbols_nmg', 'goog.labs.i18n.ListFormatSymbols_nmg_CM', 'goog.labs.i18n.ListFormatSymbols_nn', 'goog.labs.i18n.ListFormatSymbols_nn_NO', 'goog.labs.i18n.ListFormatSymbols_nnh', 'goog.labs.i18n.ListFormatSymbols_nnh_CM', 'goog.labs.i18n.ListFormatSymbols_nus', 'goog.labs.i18n.ListFormatSymbols_nus_SD', 'goog.labs.i18n.ListFormatSymbols_nyn', 'goog.labs.i18n.ListFormatSymbols_nyn_UG', 'goog.labs.i18n.ListFormatSymbols_om', 'goog.labs.i18n.ListFormatSymbols_om_ET', 'goog.labs.i18n.ListFormatSymbols_om_KE', 'goog.labs.i18n.ListFormatSymbols_or_IN', 'goog.labs.i18n.ListFormatSymbols_os', 'goog.labs.i18n.ListFormatSymbols_os_GE', 'goog.labs.i18n.ListFormatSymbols_os_RU', 'goog.labs.i18n.ListFormatSymbols_pa_Arab', 'goog.labs.i18n.ListFormatSymbols_pa_Arab_PK', 'goog.labs.i18n.ListFormatSymbols_pa_Guru', 'goog.labs.i18n.ListFormatSymbols_pa_Guru_IN', 'goog.labs.i18n.ListFormatSymbols_pl_PL', 'goog.labs.i18n.ListFormatSymbols_ps', 'goog.labs.i18n.ListFormatSymbols_ps_AF', 'goog.labs.i18n.ListFormatSymbols_pt_AO', 'goog.labs.i18n.ListFormatSymbols_pt_CV', 'goog.labs.i18n.ListFormatSymbols_pt_GW', 'goog.labs.i18n.ListFormatSymbols_pt_MO', 'goog.labs.i18n.ListFormatSymbols_pt_MZ', 'goog.labs.i18n.ListFormatSymbols_pt_ST', 'goog.labs.i18n.ListFormatSymbols_pt_TL', 'goog.labs.i18n.ListFormatSymbols_qu', 'goog.labs.i18n.ListFormatSymbols_qu_BO', 'goog.labs.i18n.ListFormatSymbols_qu_EC', 'goog.labs.i18n.ListFormatSymbols_qu_PE', 'goog.labs.i18n.ListFormatSymbols_rm', 'goog.labs.i18n.ListFormatSymbols_rm_CH', 'goog.labs.i18n.ListFormatSymbols_rn', 'goog.labs.i18n.ListFormatSymbols_rn_BI', 'goog.labs.i18n.ListFormatSymbols_ro_MD', 'goog.labs.i18n.ListFormatSymbols_ro_RO', 'goog.labs.i18n.ListFormatSymbols_rof', 'goog.labs.i18n.ListFormatSymbols_rof_TZ', 'goog.labs.i18n.ListFormatSymbols_ru_BY', 'goog.labs.i18n.ListFormatSymbols_ru_KG', 'goog.labs.i18n.ListFormatSymbols_ru_KZ', 'goog.labs.i18n.ListFormatSymbols_ru_MD', 'goog.labs.i18n.ListFormatSymbols_ru_RU', 'goog.labs.i18n.ListFormatSymbols_ru_UA', 'goog.labs.i18n.ListFormatSymbols_rw', 'goog.labs.i18n.ListFormatSymbols_rw_RW', 'goog.labs.i18n.ListFormatSymbols_rwk', 'goog.labs.i18n.ListFormatSymbols_rwk_TZ', 'goog.labs.i18n.ListFormatSymbols_sah', 'goog.labs.i18n.ListFormatSymbols_sah_RU', 'goog.labs.i18n.ListFormatSymbols_saq', 'goog.labs.i18n.ListFormatSymbols_saq_KE', 'goog.labs.i18n.ListFormatSymbols_sbp', 'goog.labs.i18n.ListFormatSymbols_sbp_TZ', 'goog.labs.i18n.ListFormatSymbols_se', 'goog.labs.i18n.ListFormatSymbols_se_FI', 'goog.labs.i18n.ListFormatSymbols_se_NO', 'goog.labs.i18n.ListFormatSymbols_se_SE', 'goog.labs.i18n.ListFormatSymbols_seh', 'goog.labs.i18n.ListFormatSymbols_seh_MZ', 'goog.labs.i18n.ListFormatSymbols_ses', 'goog.labs.i18n.ListFormatSymbols_ses_ML', 'goog.labs.i18n.ListFormatSymbols_sg', 'goog.labs.i18n.ListFormatSymbols_sg_CF', 'goog.labs.i18n.ListFormatSymbols_shi', 'goog.labs.i18n.ListFormatSymbols_shi_Latn', 'goog.labs.i18n.ListFormatSymbols_shi_Latn_MA', 'goog.labs.i18n.ListFormatSymbols_shi_Tfng', 'goog.labs.i18n.ListFormatSymbols_shi_Tfng_MA', 'goog.labs.i18n.ListFormatSymbols_si_LK', 'goog.labs.i18n.ListFormatSymbols_sk_SK', 'goog.labs.i18n.ListFormatSymbols_sl_SI', 'goog.labs.i18n.ListFormatSymbols_smn', 'goog.labs.i18n.ListFormatSymbols_smn_FI', 'goog.labs.i18n.ListFormatSymbols_sn', 'goog.labs.i18n.ListFormatSymbols_sn_ZW', 'goog.labs.i18n.ListFormatSymbols_so', 'goog.labs.i18n.ListFormatSymbols_so_DJ', 'goog.labs.i18n.ListFormatSymbols_so_ET', 'goog.labs.i18n.ListFormatSymbols_so_KE', 'goog.labs.i18n.ListFormatSymbols_so_SO', 'goog.labs.i18n.ListFormatSymbols_sq_AL', 'goog.labs.i18n.ListFormatSymbols_sq_MK', 'goog.labs.i18n.ListFormatSymbols_sq_XK', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_BA', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_ME', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_RS', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_XK', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_BA', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_ME', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_RS', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_XK', 'goog.labs.i18n.ListFormatSymbols_sv_AX', 'goog.labs.i18n.ListFormatSymbols_sv_FI', 'goog.labs.i18n.ListFormatSymbols_sv_SE', 'goog.labs.i18n.ListFormatSymbols_sw_CD', 'goog.labs.i18n.ListFormatSymbols_sw_KE', 'goog.labs.i18n.ListFormatSymbols_sw_TZ', 'goog.labs.i18n.ListFormatSymbols_sw_UG', 'goog.labs.i18n.ListFormatSymbols_ta_IN', 'goog.labs.i18n.ListFormatSymbols_ta_LK', 'goog.labs.i18n.ListFormatSymbols_ta_MY', 'goog.labs.i18n.ListFormatSymbols_ta_SG', 'goog.labs.i18n.ListFormatSymbols_te_IN', 'goog.labs.i18n.ListFormatSymbols_teo', 'goog.labs.i18n.ListFormatSymbols_teo_KE', 'goog.labs.i18n.ListFormatSymbols_teo_UG', 'goog.labs.i18n.ListFormatSymbols_th_TH', 'goog.labs.i18n.ListFormatSymbols_ti', 'goog.labs.i18n.ListFormatSymbols_ti_ER', 'goog.labs.i18n.ListFormatSymbols_ti_ET', 'goog.labs.i18n.ListFormatSymbols_to', 'goog.labs.i18n.ListFormatSymbols_to_TO', 'goog.labs.i18n.ListFormatSymbols_tr_CY', 'goog.labs.i18n.ListFormatSymbols_tr_TR', 'goog.labs.i18n.ListFormatSymbols_twq', 'goog.labs.i18n.ListFormatSymbols_twq_NE', 'goog.labs.i18n.ListFormatSymbols_tzm', 'goog.labs.i18n.ListFormatSymbols_tzm_Latn', 'goog.labs.i18n.ListFormatSymbols_tzm_Latn_MA', 'goog.labs.i18n.ListFormatSymbols_ug', 'goog.labs.i18n.ListFormatSymbols_ug_Arab', 'goog.labs.i18n.ListFormatSymbols_ug_Arab_CN', 'goog.labs.i18n.ListFormatSymbols_uk_UA', 'goog.labs.i18n.ListFormatSymbols_ur_IN', 'goog.labs.i18n.ListFormatSymbols_ur_PK', 'goog.labs.i18n.ListFormatSymbols_uz_Arab', 'goog.labs.i18n.ListFormatSymbols_uz_Arab_AF', 'goog.labs.i18n.ListFormatSymbols_uz_Cyrl', 'goog.labs.i18n.ListFormatSymbols_uz_Cyrl_UZ', 'goog.labs.i18n.ListFormatSymbols_uz_Latn', 'goog.labs.i18n.ListFormatSymbols_uz_Latn_UZ', 'goog.labs.i18n.ListFormatSymbols_vai', 'goog.labs.i18n.ListFormatSymbols_vai_Latn', 'goog.labs.i18n.ListFormatSymbols_vai_Latn_LR', 'goog.labs.i18n.ListFormatSymbols_vai_Vaii', 'goog.labs.i18n.ListFormatSymbols_vai_Vaii_LR', 'goog.labs.i18n.ListFormatSymbols_vi_VN', 'goog.labs.i18n.ListFormatSymbols_vun', 'goog.labs.i18n.ListFormatSymbols_vun_TZ', 'goog.labs.i18n.ListFormatSymbols_wae', 'goog.labs.i18n.ListFormatSymbols_wae_CH', 'goog.labs.i18n.ListFormatSymbols_xog', 'goog.labs.i18n.ListFormatSymbols_xog_UG', 'goog.labs.i18n.ListFormatSymbols_yav', 'goog.labs.i18n.ListFormatSymbols_yav_CM', 'goog.labs.i18n.ListFormatSymbols_yi', 'goog.labs.i18n.ListFormatSymbols_yi_001', 'goog.labs.i18n.ListFormatSymbols_yo', 'goog.labs.i18n.ListFormatSymbols_yo_BJ', 'goog.labs.i18n.ListFormatSymbols_yo_NG', 'goog.labs.i18n.ListFormatSymbols_zgh', 'goog.labs.i18n.ListFormatSymbols_zgh_MA', 'goog.labs.i18n.ListFormatSymbols_zh_Hans', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_CN', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_HK', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_MO', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_SG', 'goog.labs.i18n.ListFormatSymbols_zh_Hant', 'goog.labs.i18n.ListFormatSymbols_zh_Hant_HK', 'goog.labs.i18n.ListFormatSymbols_zh_Hant_MO', 'goog.labs.i18n.ListFormatSymbols_zh_Hant_TW', 'goog.labs.i18n.ListFormatSymbols_zu_ZA'], ['goog.labs.i18n.ListFormatSymbols'], false);
goog.addDependency('labs/iterable/iterable.js', ['goog.labs.iterable'], [], true);
goog.addDependency('labs/iterable/iterable_test.js', ['goog.labs.iterableTest'], ['goog.labs.iterable', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.testing.testSuite'], true);
goog.addDependency('labs/mock/mock.js', ['goog.labs.mock', 'goog.labs.mock.VerificationError'], ['goog.array', 'goog.asserts', 'goog.debug', 'goog.debug.Error', 'goog.functions', 'goog.object'], false);
goog.addDependency('labs/mock/mock_test.js', ['goog.labs.mockTest'], ['goog.array', 'goog.labs.mock', 'goog.labs.mock.VerificationError', 'goog.labs.testing.AnythingMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.string', 'goog.testing.jsunit'], false);
goog.addDependency('labs/net/image.js', ['goog.labs.net.image'], ['goog.Promise', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.net.EventType', 'goog.userAgent'], false);
goog.addDependency('labs/net/image_test.js', ['goog.labs.net.imageTest'], ['goog.labs.net.image', 'goog.string', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('labs/net/webchannel.js', ['goog.net.WebChannel'], ['goog.events', 'goog.events.Event'], false);
goog.addDependency('labs/net/webchannel/basetestchannel.js', ['goog.labs.net.webChannel.BaseTestChannel'], ['goog.labs.net.webChannel.Channel', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat'], false);
goog.addDependency('labs/net/webchannel/channel.js', ['goog.labs.net.webChannel.Channel'], [], false);
goog.addDependency('labs/net/webchannel/channelrequest.js', ['goog.labs.net.webChannel.ChannelRequest'], ['goog.Timer', 'goog.async.Throttle', 'goog.events.EventHandler', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.userAgent'], false);
goog.addDependency('labs/net/webchannel/channelrequest_test.js', ['goog.labs.net.webChannel.channelRequestTest'], ['goog.Uri', 'goog.functions', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction'], false);
goog.addDependency('labs/net/webchannel/connectionstate.js', ['goog.labs.net.webChannel.ConnectionState'], [], false);
goog.addDependency('labs/net/webchannel/forwardchannelrequestpool.js', ['goog.labs.net.webChannel.ForwardChannelRequestPool'], ['goog.array', 'goog.string', 'goog.structs.Set'], false);
goog.addDependency('labs/net/webchannel/forwardchannelrequestpool_test.js', ['goog.labs.net.webChannel.forwardChannelRequestPoolTest'], ['goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.ForwardChannelRequestPool', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('labs/net/webchannel/netutils.js', ['goog.labs.net.webChannel.netUtils'], ['goog.Uri', 'goog.labs.net.webChannel.WebChannelDebug'], false);
goog.addDependency('labs/net/webchannel/requeststats.js', ['goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Event', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.labs.net.webChannel.requestStats.ServerReachabilityEvent', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.labs.net.webChannel.requestStats.StatEvent', 'goog.labs.net.webChannel.requestStats.TimingEvent'], ['goog.events.Event', 'goog.events.EventTarget'], false);
goog.addDependency('labs/net/webchannel/webchannelbase.js', ['goog.labs.net.webChannel.WebChannelBase'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.debug.TextFormatter', 'goog.json', 'goog.labs.net.webChannel.BaseTestChannel', 'goog.labs.net.webChannel.Channel', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.ConnectionState', 'goog.labs.net.webChannel.ForwardChannelRequestPool', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.Wire', 'goog.labs.net.webChannel.WireV8', 'goog.labs.net.webChannel.netUtils', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.log', 'goog.net.XhrIo', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.CircularBuffer'], false);
goog.addDependency('labs/net/webchannel/webchannelbase_test.js', ['goog.labs.net.webChannel.webChannelBaseTest'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.functions', 'goog.json', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.ForwardChannelRequestPool', 'goog.labs.net.webChannel.WebChannelBase', 'goog.labs.net.webChannel.WebChannelBaseTransport', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.Wire', 'goog.labs.net.webChannel.netUtils', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.structs.Map', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('labs/net/webchannel/webchannelbasetransport.js', ['goog.labs.net.webChannel.WebChannelBaseTransport'], ['goog.asserts', 'goog.events.EventTarget', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.WebChannelBase', 'goog.log', 'goog.net.WebChannel', 'goog.net.WebChannelTransport', 'goog.object', 'goog.string.path'], false);
goog.addDependency('labs/net/webchannel/webchannelbasetransport_test.js', ['goog.labs.net.webChannel.webChannelBaseTransportTest'], ['goog.events', 'goog.functions', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.WebChannelBaseTransport', 'goog.net.WebChannel', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('labs/net/webchannel/webchanneldebug.js', ['goog.labs.net.webChannel.WebChannelDebug'], ['goog.json', 'goog.log'], false);
goog.addDependency('labs/net/webchannel/wire.js', ['goog.labs.net.webChannel.Wire'], [], false);
goog.addDependency('labs/net/webchannel/wirev8.js', ['goog.labs.net.webChannel.WireV8'], ['goog.asserts', 'goog.json', 'goog.json.NativeJsonProcessor', 'goog.structs'], false);
goog.addDependency('labs/net/webchannel/wirev8_test.js', ['goog.labs.net.webChannel.WireV8Test'], ['goog.labs.net.webChannel.WireV8', 'goog.testing.jsunit'], false);
goog.addDependency('labs/net/webchanneltransport.js', ['goog.net.WebChannelTransport'], [], false);
goog.addDependency('labs/net/webchanneltransportfactory.js', ['goog.net.createWebChannelTransport'], ['goog.functions', 'goog.labs.net.webChannel.WebChannelBaseTransport'], false);
goog.addDependency('labs/net/xhr.js', ['goog.labs.net.xhr', 'goog.labs.net.xhr.Error', 'goog.labs.net.xhr.HttpError', 'goog.labs.net.xhr.Options', 'goog.labs.net.xhr.PostData', 'goog.labs.net.xhr.ResponseType', 'goog.labs.net.xhr.TimeoutError'], ['goog.Promise', 'goog.asserts', 'goog.debug.Error', 'goog.json', 'goog.net.HttpStatus', 'goog.net.XmlHttp', 'goog.string', 'goog.uri.utils', 'goog.userAgent'], false);
goog.addDependency('labs/net/xhr_test.js', ['goog.labs.net.xhrTest'], ['goog.Promise', 'goog.events', 'goog.events.EventType', 'goog.labs.net.xhr', 'goog.net.WrapperXmlHttpFactory', 'goog.net.XmlHttp', 'goog.testing.MockClock', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('labs/object/object.js', ['goog.labs.object'], [], false);
goog.addDependency('labs/object/object_test.js', ['goog.labs.objectTest'], ['goog.labs.object', 'goog.testing.jsunit'], false);
goog.addDependency('labs/pubsub/broadcastpubsub.js', ['goog.labs.pubsub.BroadcastPubSub'], ['goog.Disposable', 'goog.Timer', 'goog.array', 'goog.async.run', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.math', 'goog.pubsub.PubSub', 'goog.storage.Storage', 'goog.storage.mechanism.HTML5LocalStorage', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('labs/pubsub/broadcastpubsub_test.js', ['goog.labs.pubsub.BroadcastPubSubTest'], ['goog.array', 'goog.debug.Logger', 'goog.json', 'goog.labs.pubsub.BroadcastPubSub', 'goog.storage.Storage', 'goog.structs.Map', 'goog.testing.MockClock', 'goog.testing.MockControl', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('labs/storage/boundedcollectablestorage.js', ['goog.labs.storage.BoundedCollectableStorage'], ['goog.array', 'goog.asserts', 'goog.iter', 'goog.storage.CollectableStorage', 'goog.storage.ErrorCode', 'goog.storage.ExpiringStorage'], false);
goog.addDependency('labs/storage/boundedcollectablestorage_test.js', ['goog.labs.storage.BoundedCollectableStorageTest'], ['goog.labs.storage.BoundedCollectableStorage', 'goog.storage.collectableStorageTester', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism'], false);
goog.addDependency('labs/structs/map.js', ['goog.labs.structs.Map'], ['goog.array', 'goog.asserts', 'goog.labs.object', 'goog.object'], false);
goog.addDependency('labs/structs/map_perf.js', ['goog.labs.structs.MapPerf'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.labs.structs.Map', 'goog.structs.Map', 'goog.testing.PerformanceTable', 'goog.testing.jsunit'], false);
goog.addDependency('labs/structs/map_test.js', ['goog.labs.structs.MapTest'], ['goog.labs.structs.Map', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('labs/structs/multimap.js', ['goog.labs.structs.Multimap'], ['goog.array', 'goog.labs.object', 'goog.labs.structs.Map'], false);
goog.addDependency('labs/structs/multimap_test.js', ['goog.labs.structs.MultimapTest'], ['goog.labs.structs.Map', 'goog.labs.structs.Multimap', 'goog.testing.jsunit'], false);
goog.addDependency('labs/style/pixeldensitymonitor.js', ['goog.labs.style.PixelDensityMonitor', 'goog.labs.style.PixelDensityMonitor.Density', 'goog.labs.style.PixelDensityMonitor.EventType'], ['goog.events', 'goog.events.EventTarget'], false);
goog.addDependency('labs/style/pixeldensitymonitor_test.js', ['goog.labs.style.PixelDensityMonitorTest'], ['goog.array', 'goog.dom.DomHelper', 'goog.events', 'goog.labs.style.PixelDensityMonitor', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('labs/testing/assertthat.js', ['goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat'], ['goog.debug.Error'], false);
goog.addDependency('labs/testing/assertthat_test.js', ['goog.labs.testing.assertThatTest'], ['goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('labs/testing/decoratormatcher.js', ['goog.labs.testing.AnythingMatcher'], ['goog.labs.testing.Matcher'], false);
goog.addDependency('labs/testing/decoratormatcher_test.js', ['goog.labs.testing.decoratorMatcherTest'], ['goog.labs.testing.AnythingMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit'], false);
goog.addDependency('labs/testing/dictionarymatcher.js', ['goog.labs.testing.HasEntriesMatcher', 'goog.labs.testing.HasEntryMatcher', 'goog.labs.testing.HasKeyMatcher', 'goog.labs.testing.HasValueMatcher'], ['goog.asserts', 'goog.labs.testing.Matcher', 'goog.object'], false);
goog.addDependency('labs/testing/dictionarymatcher_test.js', ['goog.labs.testing.dictionaryMatcherTest'], ['goog.labs.testing.HasEntryMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit'], false);
goog.addDependency('labs/testing/environment.js', ['goog.labs.testing.Environment'], ['goog.array', 'goog.asserts', 'goog.debug.Console', 'goog.testing.MockClock', 'goog.testing.MockControl', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('labs/testing/environment_test.js', ['goog.labs.testing.environmentTest'], ['goog.labs.testing.Environment', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.testSuite'], false);
goog.addDependency('labs/testing/environment_usage_test.js', ['goog.labs.testing.environmentUsageTest'], ['goog.labs.testing.Environment'], false);
goog.addDependency('labs/testing/json_fuzzing.js', ['goog.labs.testing.JsonFuzzing'], ['goog.string', 'goog.testing.PseudoRandom'], false);
goog.addDependency('labs/testing/json_fuzzing_test.js', ['goog.labs.testing.JsonFuzzingTest'], ['goog.json', 'goog.labs.testing.JsonFuzzing', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('labs/testing/logicmatcher.js', ['goog.labs.testing.AllOfMatcher', 'goog.labs.testing.AnyOfMatcher', 'goog.labs.testing.IsNotMatcher'], ['goog.array', 'goog.labs.testing.Matcher'], false);
goog.addDependency('labs/testing/logicmatcher_test.js', ['goog.labs.testing.logicMatcherTest'], ['goog.labs.testing.AllOfMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit'], false);
goog.addDependency('labs/testing/matcher.js', ['goog.labs.testing.Matcher'], [], false);
goog.addDependency('labs/testing/numbermatcher.js', ['goog.labs.testing.CloseToMatcher', 'goog.labs.testing.EqualToMatcher', 'goog.labs.testing.GreaterThanEqualToMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.labs.testing.LessThanEqualToMatcher', 'goog.labs.testing.LessThanMatcher'], ['goog.asserts', 'goog.labs.testing.Matcher'], false);
goog.addDependency('labs/testing/numbermatcher_test.js', ['goog.labs.testing.numberMatcherTest'], ['goog.labs.testing.LessThanMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit'], false);
goog.addDependency('labs/testing/objectmatcher.js', ['goog.labs.testing.HasPropertyMatcher', 'goog.labs.testing.InstanceOfMatcher', 'goog.labs.testing.IsNullMatcher', 'goog.labs.testing.IsNullOrUndefinedMatcher', 'goog.labs.testing.IsUndefinedMatcher', 'goog.labs.testing.ObjectEqualsMatcher'], ['goog.labs.testing.Matcher'], false);
goog.addDependency('labs/testing/objectmatcher_test.js', ['goog.labs.testing.objectMatcherTest'], ['goog.labs.testing.MatcherError', 'goog.labs.testing.ObjectEqualsMatcher', 'goog.labs.testing.assertThat', 'goog.testing.jsunit'], false);
goog.addDependency('labs/testing/stringmatcher.js', ['goog.labs.testing.ContainsStringMatcher', 'goog.labs.testing.EndsWithMatcher', 'goog.labs.testing.EqualToIgnoringWhitespaceMatcher', 'goog.labs.testing.EqualsMatcher', 'goog.labs.testing.RegexMatcher', 'goog.labs.testing.StartsWithMatcher', 'goog.labs.testing.StringContainsInOrderMatcher'], ['goog.asserts', 'goog.labs.testing.Matcher', 'goog.string'], false);
goog.addDependency('labs/testing/stringmatcher_test.js', ['goog.labs.testing.stringMatcherTest'], ['goog.labs.testing.MatcherError', 'goog.labs.testing.StringContainsInOrderMatcher', 'goog.labs.testing.assertThat', 'goog.testing.jsunit'], false);
goog.addDependency('labs/useragent/browser.js', ['goog.labs.userAgent.browser'], ['goog.array', 'goog.labs.userAgent.util', 'goog.object', 'goog.string'], false);
goog.addDependency('labs/useragent/browser_test.js', ['goog.labs.userAgent.browserTest'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.object', 'goog.testing.jsunit'], false);
goog.addDependency('labs/useragent/device.js', ['goog.labs.userAgent.device'], ['goog.labs.userAgent.util'], false);
goog.addDependency('labs/useragent/device_test.js', ['goog.labs.userAgent.deviceTest'], ['goog.labs.userAgent.device', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit'], false);
goog.addDependency('labs/useragent/engine.js', ['goog.labs.userAgent.engine'], ['goog.array', 'goog.labs.userAgent.util', 'goog.string'], false);
goog.addDependency('labs/useragent/engine_test.js', ['goog.labs.userAgent.engineTest'], ['goog.labs.userAgent.engine', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit'], false);
goog.addDependency('labs/useragent/platform.js', ['goog.labs.userAgent.platform'], ['goog.labs.userAgent.util', 'goog.string'], false);
goog.addDependency('labs/useragent/platform_test.js', ['goog.labs.userAgent.platformTest'], ['goog.labs.userAgent.platform', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit'], false);
goog.addDependency('labs/useragent/test_agents.js', ['goog.labs.userAgent.testAgents'], [], false);
goog.addDependency('labs/useragent/util.js', ['goog.labs.userAgent.util'], ['goog.string'], false);
goog.addDependency('labs/useragent/util_test.js', ['goog.labs.userAgent.utilTest'], ['goog.functions', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('locale/countries.js', ['goog.locale.countries'], [], false);
goog.addDependency('locale/countrylanguagenames_test.js', ['goog.locale.countryLanguageNamesTest'], ['goog.locale', 'goog.testing.jsunit'], false);
goog.addDependency('locale/defaultlocalenameconstants.js', ['goog.locale.defaultLocaleNameConstants'], [], false);
goog.addDependency('locale/genericfontnames.js', ['goog.locale.genericFontNames'], [], false);
goog.addDependency('locale/genericfontnames_test.js', ['goog.locale.genericFontNamesTest'], ['goog.locale.genericFontNames', 'goog.testing.jsunit'], false);
goog.addDependency('locale/genericfontnamesdata.js', ['goog.locale.genericFontNamesData'], [], false);
goog.addDependency('locale/locale.js', ['goog.locale'], ['goog.locale.nativeNameConstants'], false);
goog.addDependency('locale/nativenameconstants.js', ['goog.locale.nativeNameConstants'], [], false);
goog.addDependency('locale/scriptToLanguages.js', ['goog.locale.scriptToLanguages'], ['goog.locale'], false);
goog.addDependency('locale/timezonedetection.js', ['goog.locale.timeZoneDetection'], ['goog.locale.TimeZoneFingerprint'], false);
goog.addDependency('locale/timezonedetection_test.js', ['goog.locale.timeZoneDetectionTest'], ['goog.locale.timeZoneDetection', 'goog.testing.jsunit'], false);
goog.addDependency('locale/timezonefingerprint.js', ['goog.locale.TimeZoneFingerprint'], [], false);
goog.addDependency('locale/timezonelist.js', ['goog.locale.TimeZoneList'], ['goog.locale'], false);
goog.addDependency('locale/timezonelist_test.js', ['goog.locale.TimeZoneListTest'], ['goog.locale', 'goog.locale.TimeZoneList', 'goog.testing.jsunit'], false);
goog.addDependency('log/log.js', ['goog.log', 'goog.log.Level', 'goog.log.LogRecord', 'goog.log.Logger'], ['goog.debug', 'goog.debug.LogManager', 'goog.debug.LogRecord', 'goog.debug.Logger'], false);
goog.addDependency('log/log_test.js', ['goog.logTest'], ['goog.debug.LogManager', 'goog.log', 'goog.log.Level', 'goog.testing.jsunit'], false);
goog.addDependency('math/affinetransform.js', ['goog.math.AffineTransform'], ['goog.math'], false);
goog.addDependency('math/affinetransform_test.js', ['goog.math.AffineTransformTest'], ['goog.array', 'goog.math', 'goog.math.AffineTransform', 'goog.testing.jsunit'], false);
goog.addDependency('math/bezier.js', ['goog.math.Bezier'], ['goog.math', 'goog.math.Coordinate'], false);
goog.addDependency('math/bezier_test.js', ['goog.math.BezierTest'], ['goog.math', 'goog.math.Bezier', 'goog.math.Coordinate', 'goog.testing.jsunit'], false);
goog.addDependency('math/box.js', ['goog.math.Box'], ['goog.math.Coordinate'], false);
goog.addDependency('math/box_test.js', ['goog.math.BoxTest'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.testing.jsunit'], false);
goog.addDependency('math/coordinate.js', ['goog.math.Coordinate'], ['goog.math'], false);
goog.addDependency('math/coordinate3.js', ['goog.math.Coordinate3'], [], false);
goog.addDependency('math/coordinate3_test.js', ['goog.math.Coordinate3Test'], ['goog.math.Coordinate3', 'goog.testing.jsunit'], false);
goog.addDependency('math/coordinate_test.js', ['goog.math.CoordinateTest'], ['goog.math.Coordinate', 'goog.testing.jsunit'], false);
goog.addDependency('math/exponentialbackoff.js', ['goog.math.ExponentialBackoff'], ['goog.asserts'], false);
goog.addDependency('math/exponentialbackoff_test.js', ['goog.math.ExponentialBackoffTest'], ['goog.math.ExponentialBackoff', 'goog.testing.jsunit'], false);
goog.addDependency('math/integer.js', ['goog.math.Integer'], [], false);
goog.addDependency('math/integer_test.js', ['goog.math.IntegerTest'], ['goog.math.Integer', 'goog.testing.jsunit'], false);
goog.addDependency('math/interpolator/interpolator1.js', ['goog.math.interpolator.Interpolator1'], [], false);
goog.addDependency('math/interpolator/linear1.js', ['goog.math.interpolator.Linear1'], ['goog.array', 'goog.asserts', 'goog.math', 'goog.math.interpolator.Interpolator1'], false);
goog.addDependency('math/interpolator/linear1_test.js', ['goog.math.interpolator.Linear1Test'], ['goog.math.interpolator.Linear1', 'goog.testing.jsunit'], false);
goog.addDependency('math/interpolator/pchip1.js', ['goog.math.interpolator.Pchip1'], ['goog.math', 'goog.math.interpolator.Spline1'], false);
goog.addDependency('math/interpolator/pchip1_test.js', ['goog.math.interpolator.Pchip1Test'], ['goog.math.interpolator.Pchip1', 'goog.testing.jsunit'], false);
goog.addDependency('math/interpolator/spline1.js', ['goog.math.interpolator.Spline1'], ['goog.array', 'goog.asserts', 'goog.math', 'goog.math.interpolator.Interpolator1', 'goog.math.tdma'], false);
goog.addDependency('math/interpolator/spline1_test.js', ['goog.math.interpolator.Spline1Test'], ['goog.math.interpolator.Spline1', 'goog.testing.jsunit'], false);
goog.addDependency('math/line.js', ['goog.math.Line'], ['goog.math', 'goog.math.Coordinate'], false);
goog.addDependency('math/line_test.js', ['goog.math.LineTest'], ['goog.math.Coordinate', 'goog.math.Line', 'goog.testing.jsunit'], false);
goog.addDependency('math/long.js', ['goog.math.Long'], [], false);
goog.addDependency('math/long_test.js', ['goog.math.LongTest'], ['goog.math.Long', 'goog.testing.jsunit'], false);
goog.addDependency('math/math.js', ['goog.math'], ['goog.array', 'goog.asserts'], false);
goog.addDependency('math/math_test.js', ['goog.mathTest'], ['goog.math', 'goog.testing.jsunit'], false);
goog.addDependency('math/matrix.js', ['goog.math.Matrix'], ['goog.array', 'goog.math', 'goog.math.Size', 'goog.string'], false);
goog.addDependency('math/matrix_test.js', ['goog.math.MatrixTest'], ['goog.math.Matrix', 'goog.testing.jsunit'], false);
goog.addDependency('math/path.js', ['goog.math.Path', 'goog.math.Path.Segment'], ['goog.array', 'goog.math'], false);
goog.addDependency('math/path_test.js', ['goog.math.PathTest'], ['goog.array', 'goog.math.AffineTransform', 'goog.math.Path', 'goog.testing.jsunit'], false);
goog.addDependency('math/paths.js', ['goog.math.paths'], ['goog.math.Coordinate', 'goog.math.Path'], false);
goog.addDependency('math/paths_test.js', ['goog.math.pathsTest'], ['goog.math.Coordinate', 'goog.math.paths', 'goog.testing.jsunit'], false);
goog.addDependency('math/range.js', ['goog.math.Range'], ['goog.asserts'], false);
goog.addDependency('math/range_test.js', ['goog.math.RangeTest'], ['goog.math.Range', 'goog.testing.jsunit'], false);
goog.addDependency('math/rangeset.js', ['goog.math.RangeSet'], ['goog.array', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.math.Range'], false);
goog.addDependency('math/rangeset_test.js', ['goog.math.RangeSetTest'], ['goog.iter', 'goog.math.Range', 'goog.math.RangeSet', 'goog.testing.jsunit'], false);
goog.addDependency('math/rect.js', ['goog.math.Rect'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size'], false);
goog.addDependency('math/rect_test.js', ['goog.math.RectTest'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.testing.jsunit'], false);
goog.addDependency('math/size.js', ['goog.math.Size'], [], false);
goog.addDependency('math/size_test.js', ['goog.math.SizeTest'], ['goog.math.Size', 'goog.testing.jsunit'], false);
goog.addDependency('math/tdma.js', ['goog.math.tdma'], [], false);
goog.addDependency('math/tdma_test.js', ['goog.math.tdmaTest'], ['goog.math.tdma', 'goog.testing.jsunit'], false);
goog.addDependency('math/vec2.js', ['goog.math.Vec2'], ['goog.math', 'goog.math.Coordinate'], false);
goog.addDependency('math/vec2_test.js', ['goog.math.Vec2Test'], ['goog.math.Vec2', 'goog.testing.jsunit'], false);
goog.addDependency('math/vec3.js', ['goog.math.Vec3'], ['goog.math', 'goog.math.Coordinate3'], false);
goog.addDependency('math/vec3_test.js', ['goog.math.Vec3Test'], ['goog.math.Coordinate3', 'goog.math.Vec3', 'goog.testing.jsunit'], false);
goog.addDependency('memoize/memoize.js', ['goog.memoize'], [], false);
goog.addDependency('memoize/memoize_test.js', ['goog.memoizeTest'], ['goog.memoize', 'goog.testing.jsunit'], false);
goog.addDependency('messaging/abstractchannel.js', ['goog.messaging.AbstractChannel'], ['goog.Disposable', 'goog.json', 'goog.log', 'goog.messaging.MessageChannel'], false);
goog.addDependency('messaging/abstractchannel_test.js', ['goog.messaging.AbstractChannelTest'], ['goog.messaging.AbstractChannel', 'goog.testing.MockControl', 'goog.testing.async.MockControl', 'goog.testing.jsunit'], false);
goog.addDependency('messaging/bufferedchannel.js', ['goog.messaging.BufferedChannel'], ['goog.Disposable', 'goog.Timer', 'goog.events', 'goog.log', 'goog.messaging.MessageChannel', 'goog.messaging.MultiChannel'], false);
goog.addDependency('messaging/bufferedchannel_test.js', ['goog.messaging.BufferedChannelTest'], ['goog.debug.Console', 'goog.dom', 'goog.dom.TagName', 'goog.log', 'goog.log.Level', 'goog.messaging.BufferedChannel', 'goog.testing.MockClock', 'goog.testing.MockControl', 'goog.testing.async.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('messaging/deferredchannel.js', ['goog.messaging.DeferredChannel'], ['goog.Disposable', 'goog.messaging.MessageChannel'], false);
goog.addDependency('messaging/deferredchannel_test.js', ['goog.messaging.DeferredChannelTest'], ['goog.async.Deferred', 'goog.messaging.DeferredChannel', 'goog.testing.MockControl', 'goog.testing.async.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('messaging/loggerclient.js', ['goog.messaging.LoggerClient'], ['goog.Disposable', 'goog.debug', 'goog.debug.LogManager', 'goog.debug.Logger'], false);
goog.addDependency('messaging/loggerclient_test.js', ['goog.messaging.LoggerClientTest'], ['goog.debug', 'goog.debug.Logger', 'goog.messaging.LoggerClient', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('messaging/loggerserver.js', ['goog.messaging.LoggerServer'], ['goog.Disposable', 'goog.log', 'goog.log.Level'], false);
goog.addDependency('messaging/loggerserver_test.js', ['goog.messaging.LoggerServerTest'], ['goog.debug.LogManager', 'goog.debug.Logger', 'goog.log', 'goog.log.Level', 'goog.messaging.LoggerServer', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('messaging/messagechannel.js', ['goog.messaging.MessageChannel'], [], false);
goog.addDependency('messaging/messaging.js', ['goog.messaging'], [], false);
goog.addDependency('messaging/messaging_test.js', ['goog.testing.messaging.MockMessageChannelTest'], ['goog.messaging', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('messaging/multichannel.js', ['goog.messaging.MultiChannel', 'goog.messaging.MultiChannel.VirtualChannel'], ['goog.Disposable', 'goog.log', 'goog.messaging.MessageChannel', 'goog.object'], false);
goog.addDependency('messaging/multichannel_test.js', ['goog.messaging.MultiChannelTest'], ['goog.messaging.MultiChannel', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel', 'goog.testing.mockmatchers.IgnoreArgument'], false);
goog.addDependency('messaging/portcaller.js', ['goog.messaging.PortCaller'], ['goog.Disposable', 'goog.async.Deferred', 'goog.messaging.DeferredChannel', 'goog.messaging.PortChannel', 'goog.messaging.PortNetwork', 'goog.object'], false);
goog.addDependency('messaging/portcaller_test.js', ['goog.messaging.PortCallerTest'], ['goog.events.EventTarget', 'goog.messaging.PortCaller', 'goog.messaging.PortNetwork', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('messaging/portchannel.js', ['goog.messaging.PortChannel'], ['goog.Timer', 'goog.array', 'goog.async.Deferred', 'goog.debug', 'goog.events', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.messaging.AbstractChannel', 'goog.messaging.DeferredChannel', 'goog.object', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('messaging/portchannel_test.js', ['goog.messaging.PortChannelTest'], ['goog.Promise', 'goog.Timer', 'goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.json', 'goog.messaging.PortChannel', 'goog.testing.MockControl', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageEvent'], false);
goog.addDependency('messaging/portnetwork.js', ['goog.messaging.PortNetwork'], [], false);
goog.addDependency('messaging/portnetwork_test.js', ['goog.messaging.PortNetworkTest'], ['goog.Promise', 'goog.Timer', 'goog.messaging.PortChannel', 'goog.messaging.PortOperator', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('messaging/portoperator.js', ['goog.messaging.PortOperator'], ['goog.Disposable', 'goog.asserts', 'goog.log', 'goog.messaging.PortChannel', 'goog.messaging.PortNetwork', 'goog.object'], false);
goog.addDependency('messaging/portoperator_test.js', ['goog.messaging.PortOperatorTest'], ['goog.messaging.PortNetwork', 'goog.messaging.PortOperator', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel', 'goog.testing.messaging.MockMessagePort'], false);
goog.addDependency('messaging/respondingchannel.js', ['goog.messaging.RespondingChannel'], ['goog.Disposable', 'goog.log', 'goog.messaging.MultiChannel'], false);
goog.addDependency('messaging/respondingchannel_test.js', ['goog.messaging.RespondingChannelTest'], ['goog.messaging.RespondingChannel', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('messaging/testdata/portchannel_worker.js', ['goog.messaging.testdata.portchannel_worker'], ['goog.messaging.PortChannel'], false);
goog.addDependency('messaging/testdata/portnetwork_worker1.js', ['goog.messaging.testdata.portnetwork_worker1'], ['goog.messaging.PortCaller', 'goog.messaging.PortChannel'], false);
goog.addDependency('messaging/testdata/portnetwork_worker2.js', ['goog.messaging.testdata.portnetwork_worker2'], ['goog.messaging.PortCaller', 'goog.messaging.PortChannel'], false);
goog.addDependency('module/abstractmoduleloader.js', ['goog.module.AbstractModuleLoader'], ['goog.module'], false);
goog.addDependency('module/basemodule.js', ['goog.module.BaseModule'], ['goog.Disposable', 'goog.module'], false);
goog.addDependency('module/loader.js', ['goog.module.Loader'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.module', 'goog.object'], false);
goog.addDependency('module/module.js', ['goog.module'], [], false);
goog.addDependency('module/moduleinfo.js', ['goog.module.ModuleInfo'], ['goog.Disposable', 'goog.async.throwException', 'goog.functions', 'goog.module', 'goog.module.BaseModule', 'goog.module.ModuleLoadCallback'], false);
goog.addDependency('module/moduleinfo_test.js', ['goog.module.ModuleInfoTest'], ['goog.module.BaseModule', 'goog.module.ModuleInfo', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('module/moduleloadcallback.js', ['goog.module.ModuleLoadCallback'], ['goog.debug.entryPointRegistry', 'goog.module'], false);
goog.addDependency('module/moduleloadcallback_test.js', ['goog.module.ModuleLoadCallbackTest'], ['goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.functions', 'goog.module.ModuleLoadCallback', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('module/moduleloader.js', ['goog.module.ModuleLoader'], ['goog.Timer', 'goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventId', 'goog.events.EventTarget', 'goog.labs.userAgent.browser', 'goog.log', 'goog.module.AbstractModuleLoader', 'goog.net.BulkLoader', 'goog.net.EventType', 'goog.net.jsloader', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('module/moduleloader_test.js', ['goog.module.ModuleLoaderTest'], ['goog.Promise', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.functions', 'goog.module.ModuleLoader', 'goog.module.ModuleManager', 'goog.net.BulkLoader', 'goog.net.XmlHttp', 'goog.object', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.events.EventObserver', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('module/modulemanager.js', ['goog.module.ModuleManager', 'goog.module.ModuleManager.CallbackType', 'goog.module.ModuleManager.FailureType'], ['goog.Disposable', 'goog.array', 'goog.asserts', 'goog.async.Deferred', 'goog.debug.Trace', 'goog.dispose', 'goog.log', 'goog.module', 'goog.module.ModuleInfo', 'goog.module.ModuleLoadCallback', 'goog.object'], false);
goog.addDependency('module/modulemanager_test.js', ['goog.module.ModuleManagerTest'], ['goog.array', 'goog.functions', 'goog.module.BaseModule', 'goog.module.ModuleManager', 'goog.testing', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('module/testdata/modA_1.js', ['goog.module.testdata.modA_1'], [], false);
goog.addDependency('module/testdata/modA_2.js', ['goog.module.testdata.modA_2'], ['goog.module.ModuleManager'], false);
goog.addDependency('module/testdata/modB_1.js', ['goog.module.testdata.modB_1'], ['goog.module.ModuleManager'], false);
goog.addDependency('net/browserchannel.js', ['goog.net.BrowserChannel', 'goog.net.BrowserChannel.Error', 'goog.net.BrowserChannel.Event', 'goog.net.BrowserChannel.Handler', 'goog.net.BrowserChannel.LogSaver', 'goog.net.BrowserChannel.QueuedMap', 'goog.net.BrowserChannel.ServerReachability', 'goog.net.BrowserChannel.ServerReachabilityEvent', 'goog.net.BrowserChannel.Stat', 'goog.net.BrowserChannel.StatEvent', 'goog.net.BrowserChannel.State', 'goog.net.BrowserChannel.TimingEvent'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.debug.TextFormatter', 'goog.events.Event', 'goog.events.EventTarget', 'goog.json', 'goog.json.EvalJsonProcessor', 'goog.log', 'goog.net.BrowserTestChannel', 'goog.net.ChannelDebug', 'goog.net.ChannelRequest', 'goog.net.XhrIo', 'goog.net.tmpnetwork', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.CircularBuffer'], false);
goog.addDependency('net/browserchannel_test.js', ['goog.net.BrowserChannelTest'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.functions', 'goog.json', 'goog.net.BrowserChannel', 'goog.net.ChannelDebug', 'goog.net.ChannelRequest', 'goog.net.tmpnetwork', 'goog.structs.Map', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('net/browsertestchannel.js', ['goog.net.BrowserTestChannel'], ['goog.json.EvalJsonProcessor', 'goog.net.ChannelRequest', 'goog.net.ChannelRequest.Error', 'goog.net.tmpnetwork', 'goog.string.Parser'], false);
goog.addDependency('net/bulkloader.js', ['goog.net.BulkLoader'], ['goog.events.EventHandler', 'goog.events.EventTarget', 'goog.log', 'goog.net.BulkLoaderHelper', 'goog.net.EventType', 'goog.net.XhrIo'], false);
goog.addDependency('net/bulkloader_test.js', ['goog.net.BulkLoaderTest'], ['goog.events.Event', 'goog.events.EventHandler', 'goog.net.BulkLoader', 'goog.net.EventType', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('net/bulkloaderhelper.js', ['goog.net.BulkLoaderHelper'], ['goog.Disposable'], false);
goog.addDependency('net/channeldebug.js', ['goog.net.ChannelDebug'], ['goog.json', 'goog.log'], false);
goog.addDependency('net/channelrequest.js', ['goog.net.ChannelRequest', 'goog.net.ChannelRequest.Error'], ['goog.Timer', 'goog.async.Throttle', 'goog.dom.TagName', 'goog.dom.safe', 'goog.events.EventHandler', 'goog.html.SafeUrl', 'goog.html.uncheckedconversions', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.string', 'goog.string.Const', 'goog.userAgent'], false);
goog.addDependency('net/channelrequest_test.js', ['goog.net.ChannelRequestTest'], ['goog.Uri', 'goog.functions', 'goog.net.BrowserChannel', 'goog.net.ChannelDebug', 'goog.net.ChannelRequest', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction'], false);
goog.addDependency('net/cookies.js', ['goog.net.Cookies', 'goog.net.cookies'], [], false);
goog.addDependency('net/cookies_test.js', ['goog.net.cookiesTest'], ['goog.array', 'goog.net.cookies', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('net/corsxmlhttpfactory.js', ['goog.net.CorsXmlHttpFactory', 'goog.net.IeCorsXhrAdapter'], ['goog.net.HttpStatus', 'goog.net.XhrLike', 'goog.net.XmlHttp', 'goog.net.XmlHttpFactory'], false);
goog.addDependency('net/corsxmlhttpfactory_test.js', ['goog.net.CorsXmlHttpFactoryTest'], ['goog.net.CorsXmlHttpFactory', 'goog.net.IeCorsXhrAdapter', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('net/crossdomainrpc.js', ['goog.net.CrossDomainRpc'], ['goog.Uri', 'goog.dom', 'goog.dom.TagName', 'goog.dom.safe', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.html.legacyconversions', 'goog.json', 'goog.log', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('net/crossdomainrpc_test.js', ['goog.net.CrossDomainRpcTest'], ['goog.Promise', 'goog.log', 'goog.net.CrossDomainRpc', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('net/errorcode.js', ['goog.net.ErrorCode'], [], false);
goog.addDependency('net/eventtype.js', ['goog.net.EventType'], [], false);
goog.addDependency('net/fetchxmlhttpfactory.js', ['goog.net.FetchXmlHttp', 'goog.net.FetchXmlHttpFactory'], ['goog.asserts', 'goog.events.EventTarget', 'goog.functions', 'goog.log', 'goog.net.XhrLike', 'goog.net.XmlHttpFactory'], false);
goog.addDependency('net/fetchxmlhttpfactory_test.js', ['goog.net.FetchXmlHttpFactoryTest'], ['goog.net.FetchXmlHttp', 'goog.net.FetchXmlHttpFactory', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('net/filedownloader.js', ['goog.net.FileDownloader', 'goog.net.FileDownloader.Error'], ['goog.Disposable', 'goog.asserts', 'goog.async.Deferred', 'goog.crypt.hash32', 'goog.debug.Error', 'goog.events', 'goog.events.EventHandler', 'goog.fs', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.object'], false);
goog.addDependency('net/filedownloader_test.js', ['goog.net.FileDownloaderTest'], ['goog.fs.Error', 'goog.net.ErrorCode', 'goog.net.FileDownloader', 'goog.net.XhrIo', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.fs', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit', 'goog.testing.net.XhrIoPool'], false);
goog.addDependency('net/httpstatus.js', ['goog.net.HttpStatus'], [], false);
goog.addDependency('net/iframeio.js', ['goog.net.IframeIo', 'goog.net.IframeIo.IncrementalDataEvent'], ['goog.Timer', 'goog.Uri', 'goog.array', 'goog.asserts', 'goog.debug', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.safe', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.html.uncheckedconversions', 'goog.json', 'goog.log', 'goog.log.Level', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.reflect', 'goog.string', 'goog.string.Const', 'goog.structs', 'goog.userAgent'], false);
goog.addDependency('net/iframeio_different_base_test.js', ['goog.net.iframeIoDifferentBaseTest'], ['goog.Promise', 'goog.events', 'goog.net.EventType', 'goog.net.IframeIo', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('net/iframeio_test.js', ['goog.net.IframeIoTest'], ['goog.debug', 'goog.debug.DivConsole', 'goog.debug.LogManager', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.log', 'goog.log.Level', 'goog.net.IframeIo', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('net/iframeloadmonitor.js', ['goog.net.IframeLoadMonitor'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.userAgent'], false);
goog.addDependency('net/iframeloadmonitor_test.js', ['goog.net.IframeLoadMonitorTest'], ['goog.Promise', 'goog.Timer', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.net.IframeLoadMonitor', 'goog.testing.jsunit', 'goog.testing.testSuite'], true);
goog.addDependency('net/imageloader.js', ['goog.net.ImageLoader'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.net.EventType', 'goog.object', 'goog.userAgent'], false);
goog.addDependency('net/imageloader_test.js', ['goog.net.ImageLoaderTest'], ['goog.Promise', 'goog.Timer', 'goog.array', 'goog.dispose', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.net.EventType', 'goog.net.ImageLoader', 'goog.object', 'goog.string', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('net/ipaddress.js', ['goog.net.IpAddress', 'goog.net.Ipv4Address', 'goog.net.Ipv6Address'], ['goog.array', 'goog.math.Integer', 'goog.object', 'goog.string'], false);
goog.addDependency('net/ipaddress_test.js', ['goog.net.IpAddressTest'], ['goog.math.Integer', 'goog.net.IpAddress', 'goog.net.Ipv4Address', 'goog.net.Ipv6Address', 'goog.testing.jsunit'], false);
goog.addDependency('net/jsloader.js', ['goog.net.jsloader', 'goog.net.jsloader.Error', 'goog.net.jsloader.ErrorCode', 'goog.net.jsloader.Options'], ['goog.array', 'goog.async.Deferred', 'goog.debug.Error', 'goog.dom', 'goog.dom.TagName', 'goog.object'], false);
goog.addDependency('net/jsloader_test.js', ['goog.net.jsloaderTest'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.net.jsloader', 'goog.net.jsloader.ErrorCode', 'goog.testing.jsunit'], false);
goog.addDependency('net/jsonp.js', ['goog.net.Jsonp'], ['goog.Uri', 'goog.net.jsloader'], false);
goog.addDependency('net/jsonp_test.js', ['goog.net.JsonpTest'], ['goog.net.Jsonp', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('net/mockiframeio.js', ['goog.net.MockIFrameIo'], ['goog.events.EventTarget', 'goog.json', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.IframeIo'], false);
goog.addDependency('net/multiiframeloadmonitor.js', ['goog.net.MultiIframeLoadMonitor'], ['goog.events', 'goog.net.IframeLoadMonitor'], false);
goog.addDependency('net/multiiframeloadmonitor_test.js', ['goog.net.MultiIframeLoadMonitorTest'], ['goog.Promise', 'goog.Timer', 'goog.dom', 'goog.dom.TagName', 'goog.net.IframeLoadMonitor', 'goog.net.MultiIframeLoadMonitor', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.testSuite'], true);
goog.addDependency('net/networkstatusmonitor.js', ['goog.net.NetworkStatusMonitor'], ['goog.events.Listenable'], false);
goog.addDependency('net/networktester.js', ['goog.net.NetworkTester'], ['goog.Timer', 'goog.Uri', 'goog.log'], false);
goog.addDependency('net/networktester_test.js', ['goog.net.NetworkTesterTest'], ['goog.Uri', 'goog.net.NetworkTester', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('net/streams/jsonstreamparser.js', ['goog.net.streams.JsonStreamParser'], ['goog.asserts', 'goog.json', 'goog.net.streams.StreamParser'], false);
goog.addDependency('net/streams/jsonstreamparser_test.js', ['goog.net.streams.JsonStreamParserTest'], ['goog.array', 'goog.json', 'goog.labs.testing.JsonFuzzing', 'goog.net.streams.JsonStreamParser', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.uri.utils'], false);
goog.addDependency('net/streams/nodereadablestream.js', ['goog.net.streams.NodeReadableStream'], [], false);
goog.addDependency('net/streams/streamfactory.js', ['goog.net.streams.createXhrNodeReadableStream'], ['goog.asserts', 'goog.net.streams.XhrNodeReadableStream', 'goog.net.streams.XhrStreamReader'], false);
goog.addDependency('net/streams/streamparser.js', ['goog.net.streams.StreamParser'], [], false);
goog.addDependency('net/streams/xhrnodereadablestream.js', ['goog.net.streams.XhrNodeReadableStream'], ['goog.array', 'goog.log', 'goog.net.streams.NodeReadableStream', 'goog.net.streams.XhrStreamReader'], false);
goog.addDependency('net/streams/xhrnodereadablestream_test.js', ['goog.net.streams.XhrNodeReadableStreamTest'], ['goog.net.streams.NodeReadableStream', 'goog.net.streams.XhrNodeReadableStream', 'goog.net.streams.XhrStreamReader', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('net/streams/xhrstreamreader.js', ['goog.net.streams.XhrStreamReader'], ['goog.events.EventHandler', 'goog.log', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.net.XhrIo', 'goog.net.XmlHttp', 'goog.net.streams.JsonStreamParser', 'goog.userAgent'], false);
goog.addDependency('net/streams/xhrstreamreader_test.js', ['goog.net.streams.XhrStreamReaderTest'], ['goog.net.ErrorCode', 'goog.net.XmlHttp', 'goog.net.streams.XhrStreamReader', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.net.XhrIo'], false);
goog.addDependency('net/testdata/jsloader_test1.js', ['goog.net.testdata.jsloader_test1'], [], false);
goog.addDependency('net/testdata/jsloader_test2.js', ['goog.net.testdata.jsloader_test2'], [], false);
goog.addDependency('net/testdata/jsloader_test3.js', ['goog.net.testdata.jsloader_test3'], [], false);
goog.addDependency('net/testdata/jsloader_test4.js', ['goog.net.testdata.jsloader_test4'], [], false);
goog.addDependency('net/tmpnetwork.js', ['goog.net.tmpnetwork'], ['goog.Uri', 'goog.net.ChannelDebug'], false);
goog.addDependency('net/websocket.js', ['goog.net.WebSocket', 'goog.net.WebSocket.ErrorEvent', 'goog.net.WebSocket.EventType', 'goog.net.WebSocket.MessageEvent'], ['goog.Timer', 'goog.asserts', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.log'], false);
goog.addDependency('net/websocket_test.js', ['goog.net.WebSocketTest'], ['goog.debug.EntryPointMonitor', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.functions', 'goog.net.WebSocket', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('net/wrapperxmlhttpfactory.js', ['goog.net.WrapperXmlHttpFactory'], ['goog.net.XhrLike', 'goog.net.XmlHttpFactory'], false);
goog.addDependency('net/xhrio.js', ['goog.net.XhrIo', 'goog.net.XhrIo.ResponseType'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.debug.entryPointRegistry', 'goog.events.EventTarget', 'goog.json', 'goog.log', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.net.XmlHttp', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.Map', 'goog.uri.utils', 'goog.userAgent'], false);
goog.addDependency('net/xhrio_test.js', ['goog.net.XhrIoTest'], ['goog.Uri', 'goog.debug.EntryPointMonitor', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.functions', 'goog.net.EventType', 'goog.net.WrapperXmlHttpFactory', 'goog.net.XhrIo', 'goog.net.XmlHttp', 'goog.object', 'goog.string', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction', 'goog.userAgent.product'], false);
goog.addDependency('net/xhriopool.js', ['goog.net.XhrIoPool'], ['goog.net.XhrIo', 'goog.structs.PriorityPool'], false);
goog.addDependency('net/xhriopool_test.js', ['goog.net.XhrIoPoolTest'], ['goog.net.XhrIoPool', 'goog.structs.Map', 'goog.testing.jsunit'], false);
goog.addDependency('net/xhrlike.js', ['goog.net.XhrLike'], [], false);
goog.addDependency('net/xhrmanager.js', ['goog.net.XhrManager', 'goog.net.XhrManager.Event', 'goog.net.XhrManager.Request'], ['goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.structs.Map'], false);
goog.addDependency('net/xhrmanager_test.js', ['goog.net.XhrManagerTest'], ['goog.events', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrManager', 'goog.testing.jsunit', 'goog.testing.net.XhrIoPool', 'goog.testing.recordFunction'], false);
goog.addDependency('net/xmlhttp.js', ['goog.net.DefaultXmlHttpFactory', 'goog.net.XmlHttp', 'goog.net.XmlHttp.OptionType', 'goog.net.XmlHttp.ReadyState', 'goog.net.XmlHttpDefines'], ['goog.asserts', 'goog.net.WrapperXmlHttpFactory', 'goog.net.XmlHttpFactory'], false);
goog.addDependency('net/xmlhttpfactory.js', ['goog.net.XmlHttpFactory'], ['goog.net.XhrLike'], false);
goog.addDependency('net/xpc/crosspagechannel.js', ['goog.net.xpc.CrossPageChannel'], ['goog.Uri', 'goog.async.Deferred', 'goog.async.Delay', 'goog.dispose', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.messaging.AbstractChannel', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.ChannelStates', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.DirectTransport', 'goog.net.xpc.FrameElementMethodTransport', 'goog.net.xpc.IframePollingTransport', 'goog.net.xpc.IframeRelayTransport', 'goog.net.xpc.NativeMessagingTransport', 'goog.net.xpc.NixTransport', 'goog.net.xpc.TransportTypes', 'goog.net.xpc.UriCfgFields', 'goog.string', 'goog.uri.utils', 'goog.userAgent'], false);
goog.addDependency('net/xpc/crosspagechannel_test.js', ['goog.net.xpc.CrossPageChannelTest'], ['goog.Disposable', 'goog.Promise', 'goog.Timer', 'goog.Uri', 'goog.dom', 'goog.dom.TagName', 'goog.labs.userAgent.browser', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.TransportTypes', 'goog.object', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('net/xpc/crosspagechannelrole.js', ['goog.net.xpc.CrossPageChannelRole'], [], false);
goog.addDependency('net/xpc/directtransport.js', ['goog.net.xpc.DirectTransport'], ['goog.Timer', 'goog.async.Deferred', 'goog.events.EventHandler', 'goog.log', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.object'], false);
goog.addDependency('net/xpc/directtransport_test.js', ['goog.net.xpc.DirectTransportTest'], ['goog.Promise', 'goog.dom', 'goog.dom.TagName', 'goog.labs.userAgent.browser', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.TransportTypes', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('net/xpc/frameelementmethodtransport.js', ['goog.net.xpc.FrameElementMethodTransport'], ['goog.log', 'goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes'], false);
goog.addDependency('net/xpc/iframepollingtransport.js', ['goog.net.xpc.IframePollingTransport', 'goog.net.xpc.IframePollingTransport.Receiver', 'goog.net.xpc.IframePollingTransport.Sender'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.userAgent'], false);
goog.addDependency('net/xpc/iframepollingtransport_test.js', ['goog.net.xpc.IframePollingTransportTest'], ['goog.Timer', 'goog.dom', 'goog.dom.TagName', 'goog.functions', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.TransportTypes', 'goog.object', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('net/xpc/iframerelaytransport.js', ['goog.net.xpc.IframeRelayTransport'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.safe', 'goog.events', 'goog.html.SafeHtml', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.string', 'goog.string.Const', 'goog.userAgent'], false);
goog.addDependency('net/xpc/nativemessagingtransport.js', ['goog.net.xpc.NativeMessagingTransport'], ['goog.Timer', 'goog.asserts', 'goog.async.Deferred', 'goog.events', 'goog.events.EventHandler', 'goog.log', 'goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes'], false);
goog.addDependency('net/xpc/nativemessagingtransport_test.js', ['goog.net.xpc.NativeMessagingTransportTest'], ['goog.dom', 'goog.events', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.NativeMessagingTransport', 'goog.testing.jsunit'], false);
goog.addDependency('net/xpc/nixtransport.js', ['goog.net.xpc.NixTransport'], ['goog.log', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.reflect'], false);
goog.addDependency('net/xpc/relay.js', ['goog.net.xpc.relay'], [], false);
goog.addDependency('net/xpc/transport.js', ['goog.net.xpc.Transport'], ['goog.Disposable', 'goog.dom', 'goog.net.xpc.TransportNames'], false);
goog.addDependency('net/xpc/xpc.js', ['goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.ChannelStates', 'goog.net.xpc.TransportNames', 'goog.net.xpc.TransportTypes', 'goog.net.xpc.UriCfgFields'], ['goog.log'], false);
goog.addDependency('object/object.js', ['goog.object'], [], false);
goog.addDependency('object/object_test.js', ['goog.objectTest'], ['goog.functions', 'goog.object', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('positioning/absoluteposition.js', ['goog.positioning.AbsolutePosition'], ['goog.math.Coordinate', 'goog.positioning', 'goog.positioning.AbstractPosition'], false);
goog.addDependency('positioning/abstractposition.js', ['goog.positioning.AbstractPosition'], [], false);
goog.addDependency('positioning/anchoredposition.js', ['goog.positioning.AnchoredPosition'], ['goog.positioning', 'goog.positioning.AbstractPosition'], false);
goog.addDependency('positioning/anchoredposition_test.js', ['goog.positioning.AnchoredPositionTest'], ['goog.dom', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.style', 'goog.testing.jsunit'], false);
goog.addDependency('positioning/anchoredviewportposition.js', ['goog.positioning.AnchoredViewportPosition'], ['goog.positioning', 'goog.positioning.AnchoredPosition', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus'], false);
goog.addDependency('positioning/anchoredviewportposition_test.js', ['goog.positioning.AnchoredViewportPositionTest'], ['goog.dom', 'goog.math.Box', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.positioning.OverflowStatus', 'goog.style', 'goog.testing.jsunit'], false);
goog.addDependency('positioning/clientposition.js', ['goog.positioning.ClientPosition'], ['goog.asserts', 'goog.dom', 'goog.math.Coordinate', 'goog.positioning', 'goog.positioning.AbstractPosition', 'goog.style'], false);
goog.addDependency('positioning/clientposition_test.js', ['goog.positioning.clientPositionTest'], ['goog.dom', 'goog.dom.TagName', 'goog.positioning.ClientPosition', 'goog.positioning.Corner', 'goog.style', 'goog.testing.jsunit'], false);
goog.addDependency('positioning/menuanchoredposition.js', ['goog.positioning.MenuAnchoredPosition'], ['goog.positioning.AnchoredViewportPosition', 'goog.positioning.Overflow'], false);
goog.addDependency('positioning/menuanchoredposition_test.js', ['goog.positioning.MenuAnchoredPositionTest'], ['goog.dom', 'goog.dom.TagName', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.testing.jsunit'], false);
goog.addDependency('positioning/positioning.js', ['goog.positioning', 'goog.positioning.Corner', 'goog.positioning.CornerBit', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.style', 'goog.style.bidi'], false);
goog.addDependency('positioning/positioning_test.js', ['goog.positioningTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.TagName', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('positioning/viewportclientposition.js', ['goog.positioning.ViewportClientPosition'], ['goog.dom', 'goog.math.Coordinate', 'goog.positioning', 'goog.positioning.ClientPosition', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.style'], false);
goog.addDependency('positioning/viewportclientposition_test.js', ['goog.positioning.ViewportClientPositionTest'], ['goog.dom', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.ViewportClientPosition', 'goog.style', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('positioning/viewportposition.js', ['goog.positioning.ViewportPosition'], ['goog.math.Coordinate', 'goog.positioning', 'goog.positioning.AbstractPosition', 'goog.positioning.Corner', 'goog.style'], false);
goog.addDependency('promise/promise.js', ['goog.Promise'], ['goog.Thenable', 'goog.asserts', 'goog.async.FreeList', 'goog.async.run', 'goog.async.throwException', 'goog.debug.Error', 'goog.promise.Resolver'], false);
goog.addDependency('promise/promise_test.js', ['goog.PromiseTest'], ['goog.Promise', 'goog.Thenable', 'goog.Timer', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('promise/resolver.js', ['goog.promise.Resolver'], [], false);
goog.addDependency('promise/testsuiteadapter.js', ['goog.promise.testSuiteAdapter'], ['goog.Promise'], false);
goog.addDependency('promise/thenable.js', ['goog.Thenable'], [], false);
goog.addDependency('proto/proto.js', ['goog.proto'], ['goog.proto.Serializer'], false);
goog.addDependency('proto/serializer.js', ['goog.proto.Serializer'], ['goog.json.Serializer', 'goog.string'], false);
goog.addDependency('proto/serializer_test.js', ['goog.protoTest'], ['goog.proto', 'goog.testing.jsunit'], false);
goog.addDependency('proto2/descriptor.js', ['goog.proto2.Descriptor', 'goog.proto2.Metadata'], ['goog.array', 'goog.asserts', 'goog.object', 'goog.string'], false);
goog.addDependency('proto2/descriptor_test.js', ['goog.proto2.DescriptorTest'], ['goog.proto2.Descriptor', 'goog.proto2.Message', 'goog.testing.jsunit'], false);
goog.addDependency('proto2/fielddescriptor.js', ['goog.proto2.FieldDescriptor'], ['goog.asserts', 'goog.string'], false);
goog.addDependency('proto2/fielddescriptor_test.js', ['goog.proto2.FieldDescriptorTest'], ['goog.proto2.FieldDescriptor', 'goog.proto2.Message', 'goog.testing.jsunit'], false);
goog.addDependency('proto2/lazydeserializer.js', ['goog.proto2.LazyDeserializer'], ['goog.asserts', 'goog.proto2.Message', 'goog.proto2.Serializer'], false);
goog.addDependency('proto2/message.js', ['goog.proto2.Message'], ['goog.asserts', 'goog.proto2.Descriptor', 'goog.proto2.FieldDescriptor'], false);
goog.addDependency('proto2/message_test.js', ['goog.proto2.MessageTest'], ['goog.testing.jsunit', 'proto2.TestAllTypes', 'proto2.TestAllTypes.NestedEnum', 'proto2.TestAllTypes.NestedMessage', 'proto2.TestAllTypes.OptionalGroup', 'proto2.TestAllTypes.RepeatedGroup'], false);
goog.addDependency('proto2/objectserializer.js', ['goog.proto2.ObjectSerializer'], ['goog.asserts', 'goog.proto2.FieldDescriptor', 'goog.proto2.Serializer', 'goog.string'], false);
goog.addDependency('proto2/objectserializer_test.js', ['goog.proto2.ObjectSerializerTest'], ['goog.proto2.ObjectSerializer', 'goog.proto2.Serializer', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'proto2.TestAllTypes'], false);
goog.addDependency('proto2/package_test.pb.js', ['someprotopackage.TestPackageTypes'], ['goog.proto2.Message', 'proto2.TestAllTypes'], false);
goog.addDependency('proto2/pbliteserializer.js', ['goog.proto2.PbLiteSerializer'], ['goog.asserts', 'goog.proto2.FieldDescriptor', 'goog.proto2.LazyDeserializer', 'goog.proto2.Serializer'], false);
goog.addDependency('proto2/pbliteserializer_test.js', ['goog.proto2.PbLiteSerializerTest'], ['goog.proto2.PbLiteSerializer', 'goog.testing.jsunit', 'proto2.TestAllTypes'], false);
goog.addDependency('proto2/proto_test.js', ['goog.proto2.messageTest'], ['goog.proto2.FieldDescriptor', 'goog.testing.jsunit', 'proto2.TestAllTypes', 'someprotopackage.TestPackageTypes'], false);
goog.addDependency('proto2/serializer.js', ['goog.proto2.Serializer'], ['goog.asserts', 'goog.proto2.FieldDescriptor', 'goog.proto2.Message'], false);
goog.addDependency('proto2/test.pb.js', ['proto2.TestAllTypes', 'proto2.TestAllTypes.NestedEnum', 'proto2.TestAllTypes.NestedMessage', 'proto2.TestAllTypes.OptionalGroup', 'proto2.TestAllTypes.RepeatedGroup', 'proto2.TestDefaultChild', 'proto2.TestDefaultParent'], ['goog.proto2.Message'], false);
goog.addDependency('proto2/textformatserializer.js', ['goog.proto2.TextFormatSerializer'], ['goog.array', 'goog.asserts', 'goog.json', 'goog.math', 'goog.object', 'goog.proto2.FieldDescriptor', 'goog.proto2.Message', 'goog.proto2.Serializer', 'goog.string'], false);
goog.addDependency('proto2/textformatserializer_test.js', ['goog.proto2.TextFormatSerializerTest'], ['goog.proto2.ObjectSerializer', 'goog.proto2.TextFormatSerializer', 'goog.testing.jsunit', 'proto2.TestAllTypes'], false);
goog.addDependency('proto2/util.js', ['goog.proto2.Util'], ['goog.asserts'], false);
goog.addDependency('pubsub/pubsub.js', ['goog.pubsub.PubSub'], ['goog.Disposable', 'goog.array'], false);
goog.addDependency('pubsub/pubsub_test.js', ['goog.pubsub.PubSubTest'], ['goog.array', 'goog.pubsub.PubSub', 'goog.testing.jsunit'], false);
goog.addDependency('pubsub/topicid.js', ['goog.pubsub.TopicId'], [], false);
goog.addDependency('pubsub/typedpubsub.js', ['goog.pubsub.TypedPubSub'], ['goog.Disposable', 'goog.pubsub.PubSub'], false);
goog.addDependency('pubsub/typedpubsub_test.js', ['goog.pubsub.TypedPubSubTest'], ['goog.array', 'goog.pubsub.TopicId', 'goog.pubsub.TypedPubSub', 'goog.testing.jsunit'], false);
goog.addDependency('reflect/reflect.js', ['goog.reflect'], [], false);
goog.addDependency('result/deferredadaptor.js', ['goog.result.DeferredAdaptor'], ['goog.async.Deferred', 'goog.result', 'goog.result.Result'], false);
goog.addDependency('result/dependentresult.js', ['goog.result.DependentResult'], ['goog.result.Result'], false);
goog.addDependency('result/result_interface.js', ['goog.result.Result'], ['goog.Thenable'], false);
goog.addDependency('result/resultutil.js', ['goog.result'], ['goog.array', 'goog.result.DependentResult', 'goog.result.Result', 'goog.result.SimpleResult'], false);
goog.addDependency('result/simpleresult.js', ['goog.result.SimpleResult', 'goog.result.SimpleResult.StateError'], ['goog.Promise', 'goog.Thenable', 'goog.debug.Error', 'goog.result.Result'], false);
goog.addDependency('soy/data.js', ['goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind', 'goog.soy.data.UnsanitizedText'], ['goog.html.SafeHtml', 'goog.html.uncheckedconversions', 'goog.string.Const'], false);
goog.addDependency('soy/data_test.js', ['goog.soy.dataTest'], ['goog.html.SafeHtml', 'goog.soy.testHelper', 'goog.testing.jsunit'], false);
goog.addDependency('soy/renderer.js', ['goog.soy.InjectedDataSupplier', 'goog.soy.Renderer'], ['goog.asserts', 'goog.dom', 'goog.soy', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind'], false);
goog.addDependency('soy/renderer_test.js', ['goog.soy.RendererTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.html.SafeHtml', 'goog.i18n.bidi.Dir', 'goog.soy.Renderer', 'goog.soy.data.SanitizedContentKind', 'goog.soy.testHelper', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('soy/soy.js', ['goog.soy'], ['goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind', 'goog.string'], false);
goog.addDependency('soy/soy_test.js', ['goog.soyTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.functions', 'goog.soy', 'goog.soy.testHelper', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('soy/soy_testhelper.js', ['goog.soy.testHelper'], ['goog.dom', 'goog.dom.TagName', 'goog.i18n.bidi.Dir', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('spell/spellcheck.js', ['goog.spell.SpellCheck', 'goog.spell.SpellCheck.WordChangedEvent'], ['goog.Timer', 'goog.events.Event', 'goog.events.EventTarget', 'goog.structs.Set'], false);
goog.addDependency('spell/spellcheck_test.js', ['goog.spell.SpellCheckTest'], ['goog.spell.SpellCheck', 'goog.testing.jsunit'], false);
goog.addDependency('stats/basicstat.js', ['goog.stats.BasicStat'], ['goog.asserts', 'goog.log', 'goog.string.format', 'goog.structs.CircularBuffer'], false);
goog.addDependency('stats/basicstat_test.js', ['goog.stats.BasicStatTest'], ['goog.array', 'goog.stats.BasicStat', 'goog.string.format', 'goog.testing.PseudoRandom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('storage/collectablestorage.js', ['goog.storage.CollectableStorage'], ['goog.array', 'goog.iter', 'goog.storage.ErrorCode', 'goog.storage.ExpiringStorage', 'goog.storage.RichStorage'], false);
goog.addDependency('storage/collectablestorage_test.js', ['goog.storage.CollectableStorageTest'], ['goog.storage.CollectableStorage', 'goog.storage.collectableStorageTester', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism'], false);
goog.addDependency('storage/collectablestoragetester.js', ['goog.storage.collectableStorageTester'], ['goog.testing.asserts'], false);
goog.addDependency('storage/encryptedstorage.js', ['goog.storage.EncryptedStorage'], ['goog.crypt', 'goog.crypt.Arc4', 'goog.crypt.Sha1', 'goog.crypt.base64', 'goog.json', 'goog.json.Serializer', 'goog.storage.CollectableStorage', 'goog.storage.ErrorCode', 'goog.storage.RichStorage'], false);
goog.addDependency('storage/encryptedstorage_test.js', ['goog.storage.EncryptedStorageTest'], ['goog.json', 'goog.storage.EncryptedStorage', 'goog.storage.ErrorCode', 'goog.storage.RichStorage', 'goog.storage.collectableStorageTester', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.PseudoRandom', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism'], false);
goog.addDependency('storage/errorcode.js', ['goog.storage.ErrorCode'], [], false);
goog.addDependency('storage/expiringstorage.js', ['goog.storage.ExpiringStorage'], ['goog.storage.RichStorage'], false);
goog.addDependency('storage/expiringstorage_test.js', ['goog.storage.ExpiringStorageTest'], ['goog.storage.ExpiringStorage', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism'], false);
goog.addDependency('storage/mechanism/errorcode.js', ['goog.storage.mechanism.ErrorCode'], [], false);
goog.addDependency('storage/mechanism/errorhandlingmechanism.js', ['goog.storage.mechanism.ErrorHandlingMechanism'], ['goog.storage.mechanism.Mechanism'], false);
goog.addDependency('storage/mechanism/errorhandlingmechanism_test.js', ['goog.storage.mechanism.ErrorHandlingMechanismTest'], ['goog.storage.mechanism.ErrorHandlingMechanism', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('storage/mechanism/html5localstorage.js', ['goog.storage.mechanism.HTML5LocalStorage'], ['goog.storage.mechanism.HTML5WebStorage'], false);
goog.addDependency('storage/mechanism/html5localstorage_test.js', ['goog.storage.mechanism.HTML5LocalStorageTest'], ['goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.storage.mechanism.mechanismTestDefinition', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('storage/mechanism/html5sessionstorage.js', ['goog.storage.mechanism.HTML5SessionStorage'], ['goog.storage.mechanism.HTML5WebStorage'], false);
goog.addDependency('storage/mechanism/html5sessionstorage_test.js', ['goog.storage.mechanism.HTML5SessionStorageTest'], ['goog.storage.mechanism.HTML5SessionStorage', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.storage.mechanism.mechanismTestDefinition', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('storage/mechanism/html5webstorage.js', ['goog.storage.mechanism.HTML5WebStorage'], ['goog.asserts', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.IterableMechanism'], false);
goog.addDependency('storage/mechanism/html5webstorage_test.js', ['goog.storage.mechanism.HTML5MockStorage', 'goog.storage.mechanism.HTML5WebStorageTest', 'goog.storage.mechanism.MockThrowableStorage'], ['goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.HTML5WebStorage', 'goog.testing.jsunit'], false);
goog.addDependency('storage/mechanism/ieuserdata.js', ['goog.storage.mechanism.IEUserData'], ['goog.asserts', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.IterableMechanism', 'goog.structs.Map', 'goog.userAgent'], false);
goog.addDependency('storage/mechanism/ieuserdata_test.js', ['goog.storage.mechanism.IEUserDataTest'], ['goog.storage.mechanism.IEUserData', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.storage.mechanism.mechanismTestDefinition', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('storage/mechanism/iterablemechanism.js', ['goog.storage.mechanism.IterableMechanism'], ['goog.array', 'goog.asserts', 'goog.iter', 'goog.storage.mechanism.Mechanism'], false);
goog.addDependency('storage/mechanism/iterablemechanismtester.js', ['goog.storage.mechanism.iterableMechanismTester'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism', 'goog.testing.asserts'], false);
goog.addDependency('storage/mechanism/mechanism.js', ['goog.storage.mechanism.Mechanism'], [], false);
goog.addDependency('storage/mechanism/mechanismfactory.js', ['goog.storage.mechanism.mechanismfactory'], ['goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.HTML5SessionStorage', 'goog.storage.mechanism.IEUserData', 'goog.storage.mechanism.PrefixedMechanism'], false);
goog.addDependency('storage/mechanism/mechanismfactory_test.js', ['goog.storage.mechanism.mechanismfactoryTest'], ['goog.storage.mechanism.mechanismfactory', 'goog.testing.jsunit'], false);
goog.addDependency('storage/mechanism/mechanismseparationtester.js', ['goog.storage.mechanism.mechanismSeparationTester'], ['goog.iter.StopIteration', 'goog.storage.mechanism.mechanismTestDefinition', 'goog.testing.asserts'], false);
goog.addDependency('storage/mechanism/mechanismsharingtester.js', ['goog.storage.mechanism.mechanismSharingTester'], ['goog.iter.StopIteration', 'goog.storage.mechanism.mechanismTestDefinition', 'goog.testing.asserts'], false);
goog.addDependency('storage/mechanism/mechanismtestdefinition.js', ['goog.storage.mechanism.mechanismTestDefinition'], [], false);
goog.addDependency('storage/mechanism/mechanismtester.js', ['goog.storage.mechanism.mechanismTester'], ['goog.storage.mechanism.ErrorCode', 'goog.testing.asserts', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('storage/mechanism/prefixedmechanism.js', ['goog.storage.mechanism.PrefixedMechanism'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism'], false);
goog.addDependency('storage/mechanism/prefixedmechanism_test.js', ['goog.storage.mechanism.PrefixedMechanismTest'], ['goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.PrefixedMechanism', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.testing.jsunit'], false);
goog.addDependency('storage/richstorage.js', ['goog.storage.RichStorage', 'goog.storage.RichStorage.Wrapper'], ['goog.storage.ErrorCode', 'goog.storage.Storage'], false);
goog.addDependency('storage/richstorage_test.js', ['goog.storage.RichStorageTest'], ['goog.storage.ErrorCode', 'goog.storage.RichStorage', 'goog.storage.storage_test', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism'], false);
goog.addDependency('storage/storage.js', ['goog.storage.Storage'], ['goog.json', 'goog.storage.ErrorCode'], false);
goog.addDependency('storage/storage_test.js', ['goog.storage.storage_test'], ['goog.structs.Map', 'goog.testing.asserts'], false);
goog.addDependency('string/const.js', ['goog.string.Const'], ['goog.asserts', 'goog.string.TypedString'], false);
goog.addDependency('string/const_test.js', ['goog.string.constTest'], ['goog.string.Const', 'goog.testing.jsunit'], false);
goog.addDependency('string/linkify.js', ['goog.string.linkify'], ['goog.string'], false);
goog.addDependency('string/linkify_test.js', ['goog.string.linkifyTest'], ['goog.dom.TagName', 'goog.string', 'goog.string.linkify', 'goog.testing.dom', 'goog.testing.jsunit'], false);
goog.addDependency('string/newlines.js', ['goog.string.newlines', 'goog.string.newlines.Line'], ['goog.array'], false);
goog.addDependency('string/newlines_test.js', ['goog.string.newlinesTest'], ['goog.string.newlines', 'goog.testing.jsunit'], false);
goog.addDependency('string/parser.js', ['goog.string.Parser'], [], false);
goog.addDependency('string/path.js', ['goog.string.path'], ['goog.array', 'goog.string'], false);
goog.addDependency('string/path_test.js', ['goog.string.pathTest'], ['goog.string.path', 'goog.testing.jsunit'], false);
goog.addDependency('string/string.js', ['goog.string', 'goog.string.Unicode'], [], false);
goog.addDependency('string/string_test.js', ['goog.stringTest'], ['goog.dom.TagName', 'goog.functions', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit'], false);
goog.addDependency('string/stringbuffer.js', ['goog.string.StringBuffer'], [], false);
goog.addDependency('string/stringbuffer_test.js', ['goog.string.StringBufferTest'], ['goog.string.StringBuffer', 'goog.testing.jsunit'], false);
goog.addDependency('string/stringformat.js', ['goog.string.format'], ['goog.string'], false);
goog.addDependency('string/stringformat_test.js', ['goog.string.formatTest'], ['goog.string.format', 'goog.testing.jsunit'], false);
goog.addDependency('string/stringifier.js', ['goog.string.Stringifier'], [], false);
goog.addDependency('string/typedstring.js', ['goog.string.TypedString'], [], false);
goog.addDependency('structs/avltree.js', ['goog.structs.AvlTree', 'goog.structs.AvlTree.Node'], ['goog.structs.Collection'], false);
goog.addDependency('structs/avltree_test.js', ['goog.structs.AvlTreeTest'], ['goog.array', 'goog.structs.AvlTree', 'goog.testing.jsunit'], false);
goog.addDependency('structs/circularbuffer.js', ['goog.structs.CircularBuffer'], [], false);
goog.addDependency('structs/circularbuffer_test.js', ['goog.structs.CircularBufferTest'], ['goog.structs.CircularBuffer', 'goog.testing.jsunit'], false);
goog.addDependency('structs/collection.js', ['goog.structs.Collection'], [], false);
goog.addDependency('structs/collection_test.js', ['goog.structs.CollectionTest'], ['goog.structs.AvlTree', 'goog.structs.Set', 'goog.testing.jsunit'], false);
goog.addDependency('structs/heap.js', ['goog.structs.Heap'], ['goog.array', 'goog.object', 'goog.structs.Node'], false);
goog.addDependency('structs/heap_test.js', ['goog.structs.HeapTest'], ['goog.structs', 'goog.structs.Heap', 'goog.testing.jsunit'], false);
goog.addDependency('structs/inversionmap.js', ['goog.structs.InversionMap'], ['goog.array'], false);
goog.addDependency('structs/inversionmap_test.js', ['goog.structs.InversionMapTest'], ['goog.structs.InversionMap', 'goog.testing.jsunit'], false);
goog.addDependency('structs/linkedmap.js', ['goog.structs.LinkedMap'], ['goog.structs.Map'], false);
goog.addDependency('structs/linkedmap_test.js', ['goog.structs.LinkedMapTest'], ['goog.structs.LinkedMap', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('structs/map.js', ['goog.structs.Map'], ['goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.object'], false);
goog.addDependency('structs/map_test.js', ['goog.structs.MapTest'], ['goog.iter', 'goog.structs', 'goog.structs.Map', 'goog.testing.jsunit'], false);
goog.addDependency('structs/node.js', ['goog.structs.Node'], [], false);
goog.addDependency('structs/pool.js', ['goog.structs.Pool'], ['goog.Disposable', 'goog.structs.Queue', 'goog.structs.Set'], false);
goog.addDependency('structs/pool_test.js', ['goog.structs.PoolTest'], ['goog.structs.Pool', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('structs/prioritypool.js', ['goog.structs.PriorityPool'], ['goog.structs.Pool', 'goog.structs.PriorityQueue'], false);
goog.addDependency('structs/prioritypool_test.js', ['goog.structs.PriorityPoolTest'], ['goog.structs.PriorityPool', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('structs/priorityqueue.js', ['goog.structs.PriorityQueue'], ['goog.structs.Heap'], false);
goog.addDependency('structs/priorityqueue_test.js', ['goog.structs.PriorityQueueTest'], ['goog.structs', 'goog.structs.PriorityQueue', 'goog.testing.jsunit'], false);
goog.addDependency('structs/quadtree.js', ['goog.structs.QuadTree', 'goog.structs.QuadTree.Node', 'goog.structs.QuadTree.Point'], ['goog.math.Coordinate'], false);
goog.addDependency('structs/quadtree_test.js', ['goog.structs.QuadTreeTest'], ['goog.structs', 'goog.structs.QuadTree', 'goog.testing.jsunit'], false);
goog.addDependency('structs/queue.js', ['goog.structs.Queue'], ['goog.array'], false);
goog.addDependency('structs/queue_test.js', ['goog.structs.QueueTest'], ['goog.structs.Queue', 'goog.testing.jsunit'], false);
goog.addDependency('structs/set.js', ['goog.structs.Set'], ['goog.structs', 'goog.structs.Collection', 'goog.structs.Map'], false);
goog.addDependency('structs/set_test.js', ['goog.structs.SetTest'], ['goog.iter', 'goog.structs', 'goog.structs.Set', 'goog.testing.jsunit'], false);
goog.addDependency('structs/simplepool.js', ['goog.structs.SimplePool'], ['goog.Disposable'], false);
goog.addDependency('structs/stringset.js', ['goog.structs.StringSet'], ['goog.asserts', 'goog.iter'], false);
goog.addDependency('structs/stringset_test.js', ['goog.structs.StringSetTest'], ['goog.array', 'goog.iter', 'goog.structs.StringSet', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('structs/structs.js', ['goog.structs'], ['goog.array', 'goog.object'], false);
goog.addDependency('structs/structs_test.js', ['goog.structsTest'], ['goog.array', 'goog.dom.TagName', 'goog.structs', 'goog.structs.Map', 'goog.structs.Set', 'goog.testing.jsunit'], false);
goog.addDependency('structs/treenode.js', ['goog.structs.TreeNode'], ['goog.array', 'goog.asserts', 'goog.structs.Node'], false);
goog.addDependency('structs/treenode_test.js', ['goog.structs.TreeNodeTest'], ['goog.structs.TreeNode', 'goog.testing.jsunit'], false);
goog.addDependency('structs/trie.js', ['goog.structs.Trie'], ['goog.object', 'goog.structs'], false);
goog.addDependency('structs/trie_test.js', ['goog.structs.TrieTest'], ['goog.object', 'goog.structs', 'goog.structs.Trie', 'goog.testing.jsunit'], false);
goog.addDependency('structs/weak/weak.js', ['goog.structs.weak'], ['goog.userAgent'], false);
goog.addDependency('structs/weak/weak_test.js', ['goog.structs.weakTest'], ['goog.array', 'goog.structs.weak', 'goog.testing.jsunit'], false);
goog.addDependency('style/bidi.js', ['goog.style.bidi'], ['goog.dom', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('style/bidi_test.js', ['goog.style.bidiTest'], ['goog.dom', 'goog.style', 'goog.style.bidi', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('style/cursor.js', ['goog.style.cursor'], ['goog.userAgent'], false);
goog.addDependency('style/cursor_test.js', ['goog.style.cursorTest'], ['goog.style.cursor', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('style/style.js', ['goog.style'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.vendor', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.object', 'goog.reflect', 'goog.string', 'goog.userAgent'], false);
goog.addDependency('style/style_document_scroll_test.js', ['goog.style.style_document_scroll_test'], ['goog.dom', 'goog.style', 'goog.testing.jsunit'], false);
goog.addDependency('style/style_test.js', ['goog.style_test'], ['goog.array', 'goog.color', 'goog.dom', 'goog.dom.TagName', 'goog.events.BrowserEvent', 'goog.labs.userAgent.util', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.object', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.MockUserAgent', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgentTestUtil', 'goog.userAgentTestUtil.UserAgents'], false);
goog.addDependency('style/style_webkit_scrollbars_test.js', ['goog.style.webkitScrollbarsTest'], ['goog.asserts', 'goog.style', 'goog.styleScrollbarTester', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('style/stylescrollbartester.js', ['goog.styleScrollbarTester'], ['goog.dom', 'goog.dom.TagName', 'goog.style', 'goog.testing.asserts'], false);
goog.addDependency('style/transform.js', ['goog.style.transform'], ['goog.functions', 'goog.math.Coordinate', 'goog.math.Coordinate3', 'goog.style', 'goog.userAgent', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('style/transform_test.js', ['goog.style.transformTest'], ['goog.dom', 'goog.dom.TagName', 'goog.style.transform', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('style/transition.js', ['goog.style.transition', 'goog.style.transition.Css3Property'], ['goog.array', 'goog.asserts', 'goog.dom.TagName', 'goog.dom.safe', 'goog.dom.vendor', 'goog.functions', 'goog.html.SafeHtml', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('style/transition_test.js', ['goog.style.transitionTest'], ['goog.style', 'goog.style.transition', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('test_module.js', ['goog.test_module'], ['goog.test_module_dep'], true);
goog.addDependency('test_module_dep.js', ['goog.test_module_dep'], [], true);
goog.addDependency('testing/asserts.js', ['goog.testing.JsUnitException', 'goog.testing.asserts', 'goog.testing.asserts.ArrayLike'], ['goog.testing.stacktrace'], false);
goog.addDependency('testing/asserts_test.js', ['goog.testing.assertsTest'], ['goog.array', 'goog.dom', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.labs.userAgent.browser', 'goog.string', 'goog.structs.Map', 'goog.structs.Set', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('testing/async/mockcontrol.js', ['goog.testing.async.MockControl'], ['goog.asserts', 'goog.async.Deferred', 'goog.debug', 'goog.testing.asserts', 'goog.testing.mockmatchers.IgnoreArgument'], false);
goog.addDependency('testing/async/mockcontrol_test.js', ['goog.testing.async.MockControlTest'], ['goog.async.Deferred', 'goog.testing.MockControl', 'goog.testing.asserts', 'goog.testing.async.MockControl', 'goog.testing.jsunit'], false);
goog.addDependency('testing/asynctestcase.js', ['goog.testing.AsyncTestCase', 'goog.testing.AsyncTestCase.ControlBreakingException'], ['goog.testing.TestCase', 'goog.testing.asserts'], false);
goog.addDependency('testing/asynctestcase_async_test.js', ['goog.testing.AsyncTestCaseAsyncTest'], ['goog.testing.AsyncTestCase', 'goog.testing.jsunit'], false);
goog.addDependency('testing/asynctestcase_noasync_test.js', ['goog.testing.AsyncTestCaseSyncTest'], ['goog.testing.AsyncTestCase', 'goog.testing.jsunit'], false);
goog.addDependency('testing/asynctestcase_test.js', ['goog.testing.AsyncTestCaseTest'], ['goog.debug.Error', 'goog.testing.AsyncTestCase', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('testing/benchmark.js', ['goog.testing.benchmark'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.PerformanceTable', 'goog.testing.PerformanceTimer', 'goog.testing.TestCase'], false);
goog.addDependency('testing/continuationtestcase.js', ['goog.testing.ContinuationTestCase', 'goog.testing.ContinuationTestCase.Step', 'goog.testing.ContinuationTestCase.Test'], ['goog.array', 'goog.events.EventHandler', 'goog.testing.TestCase', 'goog.testing.asserts'], false);
goog.addDependency('testing/continuationtestcase_test.js', ['goog.testing.ContinuationTestCaseTest'], ['goog.events', 'goog.events.EventTarget', 'goog.testing.ContinuationTestCase', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('testing/deferredtestcase.js', ['goog.testing.DeferredTestCase'], ['goog.testing.AsyncTestCase', 'goog.testing.TestCase'], false);
goog.addDependency('testing/deferredtestcase_test.js', ['goog.testing.DeferredTestCaseTest'], ['goog.async.Deferred', 'goog.testing.DeferredTestCase', 'goog.testing.TestCase', 'goog.testing.TestRunner', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('testing/dom.js', ['goog.testing.dom'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.InputType', 'goog.dom.NodeIterator', 'goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.iter', 'goog.object', 'goog.string', 'goog.style', 'goog.testing.asserts', 'goog.userAgent'], false);
goog.addDependency('testing/dom_test.js', ['goog.testing.domTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('testing/editor/dom.js', ['goog.testing.editor.dom'], ['goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagWalkType', 'goog.iter', 'goog.string', 'goog.testing.asserts'], false);
goog.addDependency('testing/editor/dom_test.js', ['goog.testing.editor.domTest'], ['goog.dom', 'goog.dom.TagName', 'goog.functions', 'goog.testing.editor.dom', 'goog.testing.jsunit'], false);
goog.addDependency('testing/editor/fieldmock.js', ['goog.testing.editor.FieldMock'], ['goog.dom', 'goog.dom.Range', 'goog.editor.Field', 'goog.testing.LooseMock', 'goog.testing.mockmatchers'], false);
goog.addDependency('testing/editor/testhelper.js', ['goog.testing.editor.TestHelper'], ['goog.Disposable', 'goog.dom', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.node', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.testing.dom'], false);
goog.addDependency('testing/editor/testhelper_test.js', ['goog.testing.editor.TestHelperTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.node', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('testing/events/eventobserver.js', ['goog.testing.events.EventObserver'], ['goog.array'], false);
goog.addDependency('testing/events/eventobserver_test.js', ['goog.testing.events.EventObserverTest'], ['goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.testing.events.EventObserver', 'goog.testing.jsunit'], false);
goog.addDependency('testing/events/events.js', ['goog.testing.events', 'goog.testing.events.Event'], ['goog.Disposable', 'goog.asserts', 'goog.dom.NodeType', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.object', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('testing/events/events_test.js', ['goog.testing.eventsTest'], ['goog.array', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent'], false);
goog.addDependency('testing/events/matchers.js', ['goog.testing.events.EventMatcher'], ['goog.events.Event', 'goog.testing.mockmatchers.ArgumentMatcher'], false);
goog.addDependency('testing/events/matchers_test.js', ['goog.testing.events.EventMatcherTest'], ['goog.events.Event', 'goog.testing.events.EventMatcher', 'goog.testing.jsunit'], false);
goog.addDependency('testing/events/onlinehandler.js', ['goog.testing.events.OnlineHandler'], ['goog.events.EventTarget', 'goog.net.NetworkStatusMonitor'], false);
goog.addDependency('testing/events/onlinehandler_test.js', ['goog.testing.events.OnlineHandlerTest'], ['goog.events', 'goog.net.NetworkStatusMonitor', 'goog.testing.events.EventObserver', 'goog.testing.events.OnlineHandler', 'goog.testing.jsunit'], false);
goog.addDependency('testing/expectedfailures.js', ['goog.testing.ExpectedFailures'], ['goog.asserts', 'goog.debug.DivConsole', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.log', 'goog.style', 'goog.testing.JsUnitException', 'goog.testing.TestCase', 'goog.testing.asserts'], false);
goog.addDependency('testing/expectedfailures_test.js', ['goog.testing.ExpectedFailuresTest'], ['goog.debug.Logger', 'goog.testing.ExpectedFailures', 'goog.testing.JsUnitException', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/blob.js', ['goog.testing.fs.Blob'], ['goog.crypt.base64'], false);
goog.addDependency('testing/fs/blob_test.js', ['goog.testing.fs.BlobTest'], ['goog.testing.fs.Blob', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/directoryentry_test.js', ['goog.testing.fs.DirectoryEntryTest'], ['goog.array', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.testing.MockClock', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/entry.js', ['goog.testing.fs.DirectoryEntry', 'goog.testing.fs.Entry', 'goog.testing.fs.FileEntry'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.async.Deferred', 'goog.fs.DirectoryEntry', 'goog.fs.DirectoryEntryImpl', 'goog.fs.Entry', 'goog.fs.Error', 'goog.fs.FileEntry', 'goog.functions', 'goog.object', 'goog.string', 'goog.testing.fs.File', 'goog.testing.fs.FileWriter'], false);
goog.addDependency('testing/fs/entry_test.js', ['goog.testing.fs.EntryTest'], ['goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.testing.MockClock', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/file.js', ['goog.testing.fs.File'], ['goog.testing.fs.Blob'], false);
goog.addDependency('testing/fs/fileentry_test.js', ['goog.testing.fs.FileEntryTest'], ['goog.testing.MockClock', 'goog.testing.fs.FileEntry', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/filereader.js', ['goog.testing.fs.FileReader'], ['goog.Timer', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.testing.fs.ProgressEvent'], false);
goog.addDependency('testing/fs/filereader_test.js', ['goog.testing.fs.FileReaderTest'], ['goog.Promise', 'goog.array', 'goog.events', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.object', 'goog.testing.events.EventObserver', 'goog.testing.fs.FileReader', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/filesystem.js', ['goog.testing.fs.FileSystem'], ['goog.fs.FileSystem', 'goog.testing.fs.DirectoryEntry'], false);
goog.addDependency('testing/fs/filewriter.js', ['goog.testing.fs.FileWriter'], ['goog.Timer', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.string', 'goog.testing.fs.ProgressEvent'], false);
goog.addDependency('testing/fs/filewriter_test.js', ['goog.testing.fs.FileWriterTest'], ['goog.Promise', 'goog.array', 'goog.events', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.object', 'goog.testing.MockClock', 'goog.testing.events.EventObserver', 'goog.testing.fs.Blob', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/fs.js', ['goog.testing.fs'], ['goog.Timer', 'goog.array', 'goog.async.Deferred', 'goog.fs', 'goog.testing.fs.Blob', 'goog.testing.fs.FileSystem'], false);
goog.addDependency('testing/fs/fs_test.js', ['goog.testing.fsTest'], ['goog.testing.fs', 'goog.testing.fs.Blob', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/integration_test.js', ['goog.testing.fs.integrationTest'], ['goog.Promise', 'goog.events', 'goog.fs', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.testing.PropertyReplacer', 'goog.testing.fs', 'goog.testing.jsunit'], false);
goog.addDependency('testing/fs/progressevent.js', ['goog.testing.fs.ProgressEvent'], ['goog.events.Event'], false);
goog.addDependency('testing/functionmock.js', ['goog.testing', 'goog.testing.FunctionMock', 'goog.testing.GlobalFunctionMock', 'goog.testing.MethodMock'], ['goog.object', 'goog.testing.LooseMock', 'goog.testing.Mock', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock'], false);
goog.addDependency('testing/functionmock_test.js', ['goog.testing.FunctionMockTest'], ['goog.array', 'goog.string', 'goog.testing', 'goog.testing.FunctionMock', 'goog.testing.Mock', 'goog.testing.StrictMock', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.mockmatchers'], false);
goog.addDependency('testing/graphics.js', ['goog.testing.graphics'], ['goog.graphics.Path', 'goog.testing.asserts'], false);
goog.addDependency('testing/i18n/asserts.js', ['goog.testing.i18n.asserts'], ['goog.testing.jsunit'], false);
goog.addDependency('testing/i18n/asserts_test.js', ['goog.testing.i18n.assertsTest'], ['goog.testing.ExpectedFailures', 'goog.testing.i18n.asserts'], false);
goog.addDependency('testing/jstdtestcaseadapter.js', ['goog.testing.JsTdTestCaseAdapter'], ['goog.async.run', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('testing/jsunit.js', ['goog.testing.jsunit'], ['goog.dom.TagName', 'goog.testing.TestCase', 'goog.testing.TestRunner'], false);
goog.addDependency('testing/loosemock.js', ['goog.testing.LooseExpectationCollection', 'goog.testing.LooseMock'], ['goog.array', 'goog.structs.Map', 'goog.testing.Mock'], false);
goog.addDependency('testing/loosemock_test.js', ['goog.testing.LooseMockTest'], ['goog.testing.LooseMock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.mockmatchers'], false);
goog.addDependency('testing/messaging/mockmessagechannel.js', ['goog.testing.messaging.MockMessageChannel'], ['goog.messaging.AbstractChannel', 'goog.testing.asserts'], false);
goog.addDependency('testing/messaging/mockmessageevent.js', ['goog.testing.messaging.MockMessageEvent'], ['goog.events.BrowserEvent', 'goog.events.EventType', 'goog.testing.events.Event'], false);
goog.addDependency('testing/messaging/mockmessageport.js', ['goog.testing.messaging.MockMessagePort'], ['goog.events.EventTarget'], false);
goog.addDependency('testing/messaging/mockportnetwork.js', ['goog.testing.messaging.MockPortNetwork'], ['goog.messaging.PortNetwork', 'goog.testing.messaging.MockMessageChannel'], false);
goog.addDependency('testing/mock.js', ['goog.testing.Mock', 'goog.testing.MockExpectation'], ['goog.array', 'goog.object', 'goog.testing.JsUnitException', 'goog.testing.MockInterface', 'goog.testing.mockmatchers'], false);
goog.addDependency('testing/mock_test.js', ['goog.testing.MockTest'], ['goog.array', 'goog.testing', 'goog.testing.Mock', 'goog.testing.MockControl', 'goog.testing.MockExpectation', 'goog.testing.jsunit'], false);
goog.addDependency('testing/mockclassfactory.js', ['goog.testing.MockClassFactory', 'goog.testing.MockClassRecord'], ['goog.array', 'goog.object', 'goog.testing.LooseMock', 'goog.testing.StrictMock', 'goog.testing.TestCase', 'goog.testing.mockmatchers'], false);
goog.addDependency('testing/mockclassfactory_test.js', ['fake.BaseClass', 'fake.ChildClass', 'goog.testing.MockClassFactoryTest'], ['goog.testing', 'goog.testing.MockClassFactory', 'goog.testing.jsunit'], false);
goog.addDependency('testing/mockclock.js', ['goog.testing.MockClock'], ['goog.Disposable', 'goog.async.run', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.events.Event'], false);
goog.addDependency('testing/mockclock_test.js', ['goog.testing.MockClockTest'], ['goog.Promise', 'goog.Timer', 'goog.events', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction'], false);
goog.addDependency('testing/mockcontrol.js', ['goog.testing.MockControl'], ['goog.array', 'goog.testing', 'goog.testing.LooseMock', 'goog.testing.StrictMock'], false);
goog.addDependency('testing/mockcontrol_test.js', ['goog.testing.MockControlTest'], ['goog.testing.Mock', 'goog.testing.MockControl', 'goog.testing.jsunit'], false);
goog.addDependency('testing/mockinterface.js', ['goog.testing.MockInterface'], [], false);
goog.addDependency('testing/mockmatchers.js', ['goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.testing.mockmatchers.IgnoreArgument', 'goog.testing.mockmatchers.InstanceOf', 'goog.testing.mockmatchers.ObjectEquals', 'goog.testing.mockmatchers.RegexpMatch', 'goog.testing.mockmatchers.SaveArgument', 'goog.testing.mockmatchers.TypeOf'], ['goog.array', 'goog.dom', 'goog.testing.asserts'], false);
goog.addDependency('testing/mockmatchers_test.js', ['goog.testing.mockmatchersTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher'], false);
goog.addDependency('testing/mockrandom.js', ['goog.testing.MockRandom'], ['goog.Disposable'], false);
goog.addDependency('testing/mockrandom_test.js', ['goog.testing.MockRandomTest'], ['goog.testing.MockRandom', 'goog.testing.jsunit'], false);
goog.addDependency('testing/mockrange.js', ['goog.testing.MockRange'], ['goog.dom.AbstractRange', 'goog.testing.LooseMock'], false);
goog.addDependency('testing/mockrange_test.js', ['goog.testing.MockRangeTest'], ['goog.testing.MockRange', 'goog.testing.jsunit'], false);
goog.addDependency('testing/mockstorage.js', ['goog.testing.MockStorage'], ['goog.structs.Map'], false);
goog.addDependency('testing/mockstorage_test.js', ['goog.testing.MockStorageTest'], ['goog.testing.MockStorage', 'goog.testing.jsunit'], false);
goog.addDependency('testing/mockuseragent.js', ['goog.testing.MockUserAgent'], ['goog.Disposable', 'goog.labs.userAgent.util', 'goog.testing.PropertyReplacer', 'goog.userAgent'], false);
goog.addDependency('testing/mockuseragent_test.js', ['goog.testing.MockUserAgentTest'], ['goog.dispose', 'goog.testing.MockUserAgent', 'goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('testing/multitestrunner.js', ['goog.testing.MultiTestRunner', 'goog.testing.MultiTestRunner.TestFrame'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.functions', 'goog.object', 'goog.string', 'goog.ui.Component', 'goog.ui.ServerChart', 'goog.ui.TableSorter'], false);
goog.addDependency('testing/multitestrunner_test.js', ['goog.testing.MultiTestRunnerTest'], ['goog.Promise', 'goog.events', 'goog.testing.MockControl', 'goog.testing.MultiTestRunner', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.testSuite'], true);
goog.addDependency('testing/net/xhrio.js', ['goog.testing.net.XhrIo'], ['goog.array', 'goog.dom.xml', 'goog.events', 'goog.events.EventTarget', 'goog.json', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.net.XhrIo', 'goog.net.XmlHttp', 'goog.object', 'goog.structs.Map', 'goog.uri.utils'], false);
goog.addDependency('testing/net/xhrio_test.js', ['goog.testing.net.XhrIoTest'], ['goog.dom.xml', 'goog.events', 'goog.events.Event', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.testing.MockControl', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.mockmatchers.InstanceOf', 'goog.testing.net.XhrIo'], false);
goog.addDependency('testing/net/xhriopool.js', ['goog.testing.net.XhrIoPool'], ['goog.net.XhrIoPool', 'goog.testing.net.XhrIo'], false);
goog.addDependency('testing/objectpropertystring.js', ['goog.testing.ObjectPropertyString'], [], false);
goog.addDependency('testing/parallel_closure_test_suite.js', ['goog.testing.parallelClosureTestSuite'], ['goog.Promise', 'goog.events', 'goog.testing.MultiTestRunner', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.testSuite'], true);
goog.addDependency('testing/parallel_closure_test_suite_test.js', ['goog.testing.parallelClosureTestSuiteTest'], ['goog.testing.MockControl', 'goog.testing.MultiTestRunner', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.testing.parallelClosureTestSuite', 'goog.testing.testSuite'], true);
goog.addDependency('testing/performancetable.js', ['goog.testing.PerformanceTable'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.PerformanceTimer'], false);
goog.addDependency('testing/performancetimer.js', ['goog.testing.PerformanceTimer', 'goog.testing.PerformanceTimer.Task'], ['goog.array', 'goog.async.Deferred', 'goog.math'], false);
goog.addDependency('testing/performancetimer_test.js', ['goog.testing.PerformanceTimerTest'], ['goog.async.Deferred', 'goog.dom', 'goog.math', 'goog.testing.MockClock', 'goog.testing.PerformanceTimer', 'goog.testing.jsunit'], false);
goog.addDependency('testing/propertyreplacer.js', ['goog.testing.PropertyReplacer'], ['goog.testing.ObjectPropertyString', 'goog.userAgent'], false);
goog.addDependency('testing/propertyreplacer_test.js', ['goog.testing.PropertyReplacerTest'], ['goog.dom.TagName', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('testing/proto2/proto2.js', ['goog.testing.proto2'], ['goog.proto2.Message', 'goog.proto2.ObjectSerializer', 'goog.testing.asserts'], false);
goog.addDependency('testing/proto2/proto2_test.js', ['goog.testing.proto2Test'], ['goog.testing.jsunit', 'goog.testing.proto2', 'proto2.TestAllTypes'], false);
goog.addDependency('testing/pseudorandom.js', ['goog.testing.PseudoRandom'], ['goog.Disposable'], false);
goog.addDependency('testing/pseudorandom_test.js', ['goog.testing.PseudoRandomTest'], ['goog.testing.PseudoRandom', 'goog.testing.jsunit'], false);
goog.addDependency('testing/recordfunction.js', ['goog.testing.FunctionCall', 'goog.testing.recordConstructor', 'goog.testing.recordFunction'], ['goog.testing.asserts'], false);
goog.addDependency('testing/recordfunction_test.js', ['goog.testing.recordFunctionTest'], ['goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordConstructor', 'goog.testing.recordFunction'], false);
goog.addDependency('testing/shardingtestcase.js', ['goog.testing.ShardingTestCase'], ['goog.asserts', 'goog.testing.TestCase'], false);
goog.addDependency('testing/shardingtestcase_test.js', ['goog.testing.ShardingTestCaseTest'], ['goog.testing.ShardingTestCase', 'goog.testing.TestCase', 'goog.testing.asserts', 'goog.testing.jsunit'], false);
goog.addDependency('testing/singleton.js', ['goog.testing.singleton'], [], false);
goog.addDependency('testing/singleton_test.js', ['goog.testing.singletonTest'], ['goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.singleton'], false);
goog.addDependency('testing/stacktrace.js', ['goog.testing.stacktrace', 'goog.testing.stacktrace.Frame'], [], false);
goog.addDependency('testing/stacktrace_test.js', ['goog.testing.stacktraceTest'], ['goog.functions', 'goog.string', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.stacktrace', 'goog.testing.stacktrace.Frame', 'goog.userAgent'], false);
goog.addDependency('testing/storage/fakemechanism.js', ['goog.testing.storage.FakeMechanism'], ['goog.storage.mechanism.IterableMechanism', 'goog.structs.Map'], false);
goog.addDependency('testing/strictmock.js', ['goog.testing.StrictMock'], ['goog.array', 'goog.testing.Mock'], false);
goog.addDependency('testing/strictmock_test.js', ['goog.testing.StrictMockTest'], ['goog.testing.StrictMock', 'goog.testing.jsunit'], false);
goog.addDependency('testing/style/layoutasserts.js', ['goog.testing.style.layoutasserts'], ['goog.style', 'goog.testing.asserts', 'goog.testing.style'], false);
goog.addDependency('testing/style/layoutasserts_test.js', ['goog.testing.style.layoutassertsTest'], ['goog.dom', 'goog.dom.TagName', 'goog.style', 'goog.testing.jsunit', 'goog.testing.style.layoutasserts'], false);
goog.addDependency('testing/style/style.js', ['goog.testing.style'], ['goog.dom', 'goog.math.Rect', 'goog.style'], false);
goog.addDependency('testing/style/style_test.js', ['goog.testing.styleTest'], ['goog.dom', 'goog.dom.TagName', 'goog.style', 'goog.testing.jsunit', 'goog.testing.style'], false);
goog.addDependency('testing/testcase.js', ['goog.testing.TestCase', 'goog.testing.TestCase.Error', 'goog.testing.TestCase.Order', 'goog.testing.TestCase.Result', 'goog.testing.TestCase.Test'], ['goog.Promise', 'goog.Thenable', 'goog.asserts', 'goog.dom.TagName', 'goog.object', 'goog.testing.asserts', 'goog.testing.stacktrace'], false);
goog.addDependency('testing/testcase_test.js', ['goog.testing.TestCaseTest'], ['goog.Promise', 'goog.string', 'goog.testing.MockRandom', 'goog.testing.TestCase', 'goog.testing.jsunit'], false);
goog.addDependency('testing/testqueue.js', ['goog.testing.TestQueue'], [], false);
goog.addDependency('testing/testrunner.js', ['goog.testing.TestRunner'], ['goog.dom.TagName', 'goog.testing.TestCase'], false);
goog.addDependency('testing/testsuite.js', ['goog.testing.testSuite'], ['goog.labs.testing.Environment', 'goog.testing.TestCase'], false);
goog.addDependency('testing/ui/rendererasserts.js', ['goog.testing.ui.rendererasserts'], ['goog.testing.asserts', 'goog.ui.ControlRenderer'], false);
goog.addDependency('testing/ui/rendererasserts_test.js', ['goog.testing.ui.rendererassertsTest'], ['goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.ControlRenderer'], false);
goog.addDependency('testing/ui/rendererharness.js', ['goog.testing.ui.RendererHarness'], ['goog.Disposable', 'goog.dom.NodeType', 'goog.testing.asserts', 'goog.testing.dom'], false);
goog.addDependency('testing/ui/style.js', ['goog.testing.ui.style'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.testing.asserts'], false);
goog.addDependency('testing/ui/style_test.js', ['goog.testing.ui.styleTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.testing.ui.style'], false);
goog.addDependency('timer/timer.js', ['goog.Timer'], ['goog.Promise', 'goog.events.EventTarget'], false);
goog.addDependency('timer/timer_test.js', ['goog.TimerTest'], ['goog.Promise', 'goog.Timer', 'goog.events', 'goog.testing.MockClock', 'goog.testing.jsunit'], false);
goog.addDependency('tweak/entries.js', ['goog.tweak.BaseEntry', 'goog.tweak.BasePrimitiveSetting', 'goog.tweak.BaseSetting', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.StringSetting'], ['goog.array', 'goog.asserts', 'goog.log', 'goog.object'], false);
goog.addDependency('tweak/entries_test.js', ['goog.tweak.BaseEntryTest'], ['goog.testing.MockControl', 'goog.testing.jsunit', 'goog.tweak.testhelpers'], false);
goog.addDependency('tweak/registry.js', ['goog.tweak.Registry'], ['goog.array', 'goog.asserts', 'goog.log', 'goog.string', 'goog.tweak.BasePrimitiveSetting', 'goog.tweak.BaseSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.NumericSetting', 'goog.tweak.StringSetting', 'goog.uri.utils'], false);
goog.addDependency('tweak/registry_test.js', ['goog.tweak.RegistryTest'], ['goog.asserts.AssertionError', 'goog.testing.jsunit', 'goog.tweak', 'goog.tweak.testhelpers'], false);
goog.addDependency('tweak/testhelpers.js', ['goog.tweak.testhelpers'], ['goog.tweak', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.Registry', 'goog.tweak.StringSetting'], false);
goog.addDependency('tweak/tweak.js', ['goog.tweak', 'goog.tweak.ConfigParams'], ['goog.asserts', 'goog.tweak.BaseSetting', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.Registry', 'goog.tweak.StringSetting'], false);
goog.addDependency('tweak/tweakui.js', ['goog.tweak.EntriesPanel', 'goog.tweak.TweakUi'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.object', 'goog.string.Const', 'goog.style', 'goog.tweak', 'goog.tweak.BaseEntry', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.StringSetting', 'goog.ui.Zippy', 'goog.userAgent'], false);
goog.addDependency('tweak/tweakui_test.js', ['goog.tweak.TweakUiTest'], ['goog.dom', 'goog.dom.TagName', 'goog.string', 'goog.testing.jsunit', 'goog.tweak', 'goog.tweak.TweakUi', 'goog.tweak.testhelpers'], false);
goog.addDependency('ui/abstractspellchecker.js', ['goog.ui.AbstractSpellChecker', 'goog.ui.AbstractSpellChecker.AsyncResult'], ['goog.a11y.aria', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.InputType', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.dom.selection', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.spell.SpellCheck', 'goog.structs.Set', 'goog.style', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.MenuSeparator', 'goog.ui.PopupMenu'], false);
goog.addDependency('ui/ac/ac.js', ['goog.ui.ac'], ['goog.ui.ac.ArrayMatcher', 'goog.ui.ac.AutoComplete', 'goog.ui.ac.InputHandler', 'goog.ui.ac.Renderer'], false);
goog.addDependency('ui/ac/ac_test.js', ['goog.ui.acTest'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.dom.selection', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.ui.ac', 'goog.userAgent'], false);
goog.addDependency('ui/ac/arraymatcher.js', ['goog.ui.ac.ArrayMatcher'], ['goog.string'], false);
goog.addDependency('ui/ac/arraymatcher_test.js', ['goog.ui.ac.ArrayMatcherTest'], ['goog.testing.jsunit', 'goog.ui.ac.ArrayMatcher'], false);
goog.addDependency('ui/ac/autocomplete.js', ['goog.ui.ac.AutoComplete', 'goog.ui.ac.AutoComplete.EventType'], ['goog.array', 'goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.object'], false);
goog.addDependency('ui/ac/autocomplete_test.js', ['goog.ui.ac.AutoCompleteTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.string', 'goog.testing.MockControl', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.ui.ac.AutoComplete', 'goog.ui.ac.InputHandler', 'goog.ui.ac.RenderOptions', 'goog.ui.ac.Renderer'], false);
goog.addDependency('ui/ac/cachingmatcher.js', ['goog.ui.ac.CachingMatcher'], ['goog.array', 'goog.async.Throttle', 'goog.ui.ac.ArrayMatcher', 'goog.ui.ac.RenderOptions'], false);
goog.addDependency('ui/ac/cachingmatcher_test.js', ['goog.ui.ac.CachingMatcherTest'], ['goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.ui.ac.CachingMatcher'], false);
goog.addDependency('ui/ac/inputhandler.js', ['goog.ui.ac.InputHandler'], ['goog.Disposable', 'goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.selection', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.string', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('ui/ac/inputhandler_test.js', ['goog.ui.ac.InputHandlerTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.selection', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.KeyCodes', 'goog.functions', 'goog.object', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.ui.ac.InputHandler', 'goog.userAgent'], false);
goog.addDependency('ui/ac/remote.js', ['goog.ui.ac.Remote'], ['goog.ui.ac.AutoComplete', 'goog.ui.ac.InputHandler', 'goog.ui.ac.RemoteArrayMatcher', 'goog.ui.ac.Renderer'], false);
goog.addDependency('ui/ac/remotearraymatcher.js', ['goog.ui.ac.RemoteArrayMatcher'], ['goog.Disposable', 'goog.Uri', 'goog.events', 'goog.json', 'goog.net.EventType', 'goog.net.XhrIo'], false);
goog.addDependency('ui/ac/remotearraymatcher_test.js', ['goog.ui.ac.RemoteArrayMatcherTest'], ['goog.json', 'goog.net.XhrIo', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.ui.ac.RemoteArrayMatcher'], false);
goog.addDependency('ui/ac/renderer.js', ['goog.ui.ac.Renderer', 'goog.ui.ac.Renderer.CustomRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dispose', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.dom.FadeInAndShow', 'goog.fx.dom.FadeOutAndHide', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.string', 'goog.style', 'goog.ui.IdGenerator', 'goog.ui.ac.AutoComplete'], false);
goog.addDependency('ui/ac/renderer_test.js', ['goog.ui.ac.RendererTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.fx.dom.FadeInAndShow', 'goog.fx.dom.FadeOutAndHide', 'goog.string', 'goog.style', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.ui.ac.AutoComplete', 'goog.ui.ac.Renderer'], false);
goog.addDependency('ui/ac/renderoptions.js', ['goog.ui.ac.RenderOptions'], [], false);
goog.addDependency('ui/ac/richinputhandler.js', ['goog.ui.ac.RichInputHandler'], ['goog.ui.ac.InputHandler'], false);
goog.addDependency('ui/ac/richremote.js', ['goog.ui.ac.RichRemote'], ['goog.ui.ac.AutoComplete', 'goog.ui.ac.Remote', 'goog.ui.ac.Renderer', 'goog.ui.ac.RichInputHandler', 'goog.ui.ac.RichRemoteArrayMatcher'], false);
goog.addDependency('ui/ac/richremotearraymatcher.js', ['goog.ui.ac.RichRemoteArrayMatcher'], ['goog.dom.safe', 'goog.html.legacyconversions', 'goog.json', 'goog.ui.ac.RemoteArrayMatcher'], false);
goog.addDependency('ui/activitymonitor.js', ['goog.ui.ActivityMonitor'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType'], false);
goog.addDependency('ui/activitymonitor_test.js', ['goog.ui.ActivityMonitorTest'], ['goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.ActivityMonitor'], false);
goog.addDependency('ui/advancedtooltip.js', ['goog.ui.AdvancedTooltip'], ['goog.events', 'goog.events.EventType', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style', 'goog.ui.Tooltip', 'goog.userAgent'], false);
goog.addDependency('ui/advancedtooltip_test.js', ['goog.ui.AdvancedTooltipTest'], ['goog.dom', 'goog.dom.TagName', 'goog.events.Event', 'goog.events.EventType', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.AdvancedTooltip', 'goog.ui.Tooltip', 'goog.userAgent'], false);
goog.addDependency('ui/animatedzippy.js', ['goog.ui.AnimatedZippy'], ['goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.fx.easing', 'goog.ui.Zippy', 'goog.ui.ZippyEvent'], false);
goog.addDependency('ui/animatedzippy_test.js', ['goog.ui.AnimatedZippyTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.events', 'goog.functions', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.ui.AnimatedZippy', 'goog.ui.Zippy'], false);
goog.addDependency('ui/attachablemenu.js', ['goog.ui.AttachableMenu'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.Event', 'goog.events.KeyCodes', 'goog.string', 'goog.style', 'goog.ui.ItemEvent', 'goog.ui.MenuBase', 'goog.ui.PopupBase', 'goog.userAgent'], false);
goog.addDependency('ui/bidiinput.js', ['goog.ui.BidiInput'], ['goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.events', 'goog.events.InputHandler', 'goog.i18n.bidi', 'goog.ui.Component'], false);
goog.addDependency('ui/bidiinput_test.js', ['goog.ui.BidiInputTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.ui.BidiInput'], false);
goog.addDependency('ui/bubble.js', ['goog.ui.Bubble'], ['goog.Timer', 'goog.dom.safe', 'goog.events', 'goog.events.EventType', 'goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.math.Box', 'goog.positioning', 'goog.positioning.AbsolutePosition', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.CornerBit', 'goog.string.Const', 'goog.style', 'goog.ui.Component', 'goog.ui.Popup'], false);
goog.addDependency('ui/button.js', ['goog.ui.Button', 'goog.ui.Button.Side'], ['goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.ui.ButtonRenderer', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.NativeButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/button_test.js', ['goog.ui.ButtonTest'], ['goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.NativeButtonRenderer'], false);
goog.addDependency('ui/buttonrenderer.js', ['goog.ui.ButtonRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.ControlRenderer'], false);
goog.addDependency('ui/buttonrenderer_test.js', ['goog.ui.ButtonRendererTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.ButtonSide', 'goog.ui.Component'], false);
goog.addDependency('ui/buttonside.js', ['goog.ui.ButtonSide'], [], false);
goog.addDependency('ui/charcounter.js', ['goog.ui.CharCounter', 'goog.ui.CharCounter.Display'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.InputHandler'], false);
goog.addDependency('ui/charcounter_test.js', ['goog.ui.CharCounterTest'], ['goog.dom', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.ui.CharCounter', 'goog.userAgent'], false);
goog.addDependency('ui/charpicker.js', ['goog.ui.CharPicker'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.i18n.CharListDecompressor', 'goog.i18n.uChar', 'goog.structs.Set', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.ContainerScroller', 'goog.ui.FlatButtonRenderer', 'goog.ui.HoverCard', 'goog.ui.LabelInput', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.Tooltip'], false);
goog.addDependency('ui/charpicker_test.js', ['goog.ui.CharPickerTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dispose', 'goog.dom', 'goog.events.Event', 'goog.events.EventType', 'goog.i18n.CharPickerData', 'goog.i18n.uChar.NameFetcher', 'goog.testing.MockControl', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.ui.CharPicker', 'goog.ui.FlatButtonRenderer'], false);
goog.addDependency('ui/checkbox.js', ['goog.ui.Checkbox', 'goog.ui.Checkbox.State'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.string', 'goog.ui.CheckboxRenderer', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.registry'], false);
goog.addDependency('ui/checkbox_test.js', ['goog.ui.CheckboxTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.KeyCodes', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Checkbox', 'goog.ui.CheckboxRenderer', 'goog.ui.Component', 'goog.ui.ControlRenderer', 'goog.ui.decorate'], false);
goog.addDependency('ui/checkboxmenuitem.js', ['goog.ui.CheckBoxMenuItem'], ['goog.ui.MenuItem', 'goog.ui.registry'], false);
goog.addDependency('ui/checkboxrenderer.js', ['goog.ui.CheckboxRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.object', 'goog.ui.ControlRenderer'], false);
goog.addDependency('ui/colorbutton.js', ['goog.ui.ColorButton'], ['goog.ui.Button', 'goog.ui.ColorButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/colorbutton_test.js', ['goog.ui.ColorButtonTest'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.jsunit', 'goog.ui.ColorButton', 'goog.ui.decorate'], false);
goog.addDependency('ui/colorbuttonrenderer.js', ['goog.ui.ColorButtonRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.functions', 'goog.ui.ColorMenuButtonRenderer'], false);
goog.addDependency('ui/colormenubutton.js', ['goog.ui.ColorMenuButton'], ['goog.array', 'goog.object', 'goog.ui.ColorMenuButtonRenderer', 'goog.ui.ColorPalette', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.registry'], false);
goog.addDependency('ui/colormenubuttonrenderer.js', ['goog.ui.ColorMenuButtonRenderer'], ['goog.asserts', 'goog.color', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.MenuButtonRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/colormenubuttonrenderer_test.js', ['goog.ui.ColorMenuButtonTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.testing.ui.RendererHarness', 'goog.testing.ui.rendererasserts', 'goog.ui.ColorMenuButton', 'goog.ui.ColorMenuButtonRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/colorpalette.js', ['goog.ui.ColorPalette'], ['goog.array', 'goog.color', 'goog.dom.TagName', 'goog.style', 'goog.ui.Palette', 'goog.ui.PaletteRenderer'], false);
goog.addDependency('ui/colorpalette_test.js', ['goog.ui.ColorPaletteTest'], ['goog.color', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.ColorPalette'], false);
goog.addDependency('ui/colorpicker.js', ['goog.ui.ColorPicker', 'goog.ui.ColorPicker.EventType'], ['goog.ui.ColorPalette', 'goog.ui.Component'], false);
goog.addDependency('ui/colorsplitbehavior.js', ['goog.ui.ColorSplitBehavior'], ['goog.ui.ColorMenuButton', 'goog.ui.SplitBehavior'], false);
goog.addDependency('ui/combobox.js', ['goog.ui.ComboBox', 'goog.ui.ComboBoxItem'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.log', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.ItemEvent', 'goog.ui.LabelInput', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.MenuSeparator', 'goog.ui.registry', 'goog.userAgent'], false);
goog.addDependency('ui/combobox_test.js', ['goog.ui.ComboBoxTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.KeyCodes', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.ComboBox', 'goog.ui.ComboBoxItem', 'goog.ui.Component', 'goog.ui.ControlRenderer', 'goog.ui.LabelInput', 'goog.ui.Menu', 'goog.ui.MenuItem'], false);
goog.addDependency('ui/component.js', ['goog.ui.Component', 'goog.ui.Component.Error', 'goog.ui.Component.EventType', 'goog.ui.Component.State'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.object', 'goog.style', 'goog.ui.IdGenerator'], false);
goog.addDependency('ui/component_test.js', ['goog.ui.ComponentTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.events.EventTarget', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.ui.Component'], false);
goog.addDependency('ui/container.js', ['goog.ui.Container', 'goog.ui.Container.EventType', 'goog.ui.Container.Orientation'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.object', 'goog.style', 'goog.ui.Component', 'goog.ui.ContainerRenderer', 'goog.ui.Control'], false);
goog.addDependency('ui/container_test.js', ['goog.ui.ContainerTest'], ['goog.a11y.aria', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.KeyCodes', 'goog.events.KeyEvent', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.Container', 'goog.ui.Control'], false);
goog.addDependency('ui/containerrenderer.js', ['goog.ui.ContainerRenderer'], ['goog.a11y.aria', 'goog.array', 'goog.asserts', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.string', 'goog.style', 'goog.ui.registry', 'goog.userAgent'], false);
goog.addDependency('ui/containerrenderer_test.js', ['goog.ui.ContainerRendererTest'], ['goog.dom', 'goog.dom.TagName', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.Container', 'goog.ui.ContainerRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/containerscroller.js', ['goog.ui.ContainerScroller'], ['goog.Disposable', 'goog.Timer', 'goog.events.EventHandler', 'goog.style', 'goog.ui.Component', 'goog.ui.Container'], false);
goog.addDependency('ui/containerscroller_test.js', ['goog.ui.ContainerScrollerTest'], ['goog.dom', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Container', 'goog.ui.ContainerScroller'], false);
goog.addDependency('ui/control.js', ['goog.ui.Control'], ['goog.Disposable', 'goog.array', 'goog.dom', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.string', 'goog.ui.Component', 'goog.ui.ControlContent', 'goog.ui.ControlRenderer', 'goog.ui.decorate', 'goog.ui.registry', 'goog.userAgent'], false);
goog.addDependency('ui/control_test.js', ['goog.ui.ControlTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.object', 'goog.string', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.ControlRenderer', 'goog.ui.registry', 'goog.userAgent'], false);
goog.addDependency('ui/controlcontent.js', ['goog.ui.ControlContent'], [], false);
goog.addDependency('ui/controlrenderer.js', ['goog.ui.ControlRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.object', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.userAgent'], false);
goog.addDependency('ui/controlrenderer_test.js', ['goog.ui.ControlRendererTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.object', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.ControlRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/cookieeditor.js', ['goog.ui.CookieEditor'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.events.EventType', 'goog.net.cookies', 'goog.string', 'goog.style', 'goog.ui.Component'], false);
goog.addDependency('ui/cookieeditor_test.js', ['goog.ui.CookieEditorTest'], ['goog.dom', 'goog.events.Event', 'goog.events.EventType', 'goog.net.cookies', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.CookieEditor'], false);
goog.addDependency('ui/css3buttonrenderer.js', ['goog.ui.Css3ButtonRenderer'], ['goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.Component', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry'], false);
goog.addDependency('ui/css3menubuttonrenderer.js', ['goog.ui.Css3MenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuButton', 'goog.ui.MenuButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/cssnames.js', ['goog.ui.INLINE_BLOCK_CLASSNAME'], [], false);
goog.addDependency('ui/custombutton.js', ['goog.ui.CustomButton'], ['goog.ui.Button', 'goog.ui.CustomButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/custombuttonrenderer.js', ['goog.ui.CustomButtonRenderer'], ['goog.a11y.aria.Role', 'goog.asserts', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.string', 'goog.ui.ButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME'], false);
goog.addDependency('ui/customcolorpalette.js', ['goog.ui.CustomColorPalette'], ['goog.color', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.ColorPalette', 'goog.ui.Component'], false);
goog.addDependency('ui/customcolorpalette_test.js', ['goog.ui.CustomColorPaletteTest'], ['goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.jsunit', 'goog.ui.CustomColorPalette'], false);
goog.addDependency('ui/datepicker.js', ['goog.ui.DatePicker', 'goog.ui.DatePicker.Events', 'goog.ui.DatePickerEvent'], ['goog.a11y.aria', 'goog.asserts', 'goog.date.Date', 'goog.date.DateRange', 'goog.date.Interval', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyHandler', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimePatterns', 'goog.i18n.DateTimeSymbols', 'goog.style', 'goog.ui.Component', 'goog.ui.DefaultDatePickerRenderer', 'goog.ui.IdGenerator'], false);
goog.addDependency('ui/datepicker_test.js', ['goog.ui.DatePickerTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.date.Date', 'goog.date.DateRange', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_en_US', 'goog.i18n.DateTimeSymbols_zh_HK', 'goog.style', 'goog.testing.jsunit', 'goog.ui.DatePicker'], false);
goog.addDependency('ui/datepickerrenderer.js', ['goog.ui.DatePickerRenderer'], [], false);
goog.addDependency('ui/decorate.js', ['goog.ui.decorate'], ['goog.ui.registry'], false);
goog.addDependency('ui/decorate_test.js', ['goog.ui.decorateTest'], ['goog.testing.jsunit', 'goog.ui.decorate', 'goog.ui.registry'], false);
goog.addDependency('ui/defaultdatepickerrenderer.js', ['goog.ui.DefaultDatePickerRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.ui.DatePickerRenderer'], false);
goog.addDependency('ui/dialog.js', ['goog.ui.Dialog', 'goog.ui.Dialog.ButtonSet', 'goog.ui.Dialog.ButtonSet.DefaultButtons', 'goog.ui.Dialog.DefaultButtonCaptions', 'goog.ui.Dialog.DefaultButtonKeys', 'goog.ui.Dialog.Event', 'goog.ui.Dialog.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.dom.safe', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Dragger', 'goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.math.Rect', 'goog.string', 'goog.structs.Map', 'goog.style', 'goog.ui.ModalPopup'], false);
goog.addDependency('ui/dialog_test.js', ['goog.ui.DialogTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.css3', 'goog.html.SafeHtml', 'goog.html.testing', 'goog.style', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.Dialog', 'goog.userAgent'], false);
goog.addDependency('ui/dimensionpicker.js', ['goog.ui.DimensionPicker'], ['goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Size', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.DimensionPickerRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/dimensionpicker_test.js', ['goog.ui.DimensionPickerTest'], ['goog.dom', 'goog.dom.TagName', 'goog.events.KeyCodes', 'goog.math.Size', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.DimensionPicker', 'goog.ui.DimensionPickerRenderer'], false);
goog.addDependency('ui/dimensionpickerrenderer.js', ['goog.ui.DimensionPickerRenderer'], ['goog.a11y.aria.Announcer', 'goog.a11y.aria.LivePriority', 'goog.dom', 'goog.dom.TagName', 'goog.i18n.bidi', 'goog.style', 'goog.ui.ControlRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/dimensionpickerrenderer_test.js', ['goog.ui.DimensionPickerRendererTest'], ['goog.a11y.aria.LivePriority', 'goog.array', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.DimensionPicker', 'goog.ui.DimensionPickerRenderer'], false);
goog.addDependency('ui/dragdropdetector.js', ['goog.ui.DragDropDetector', 'goog.ui.DragDropDetector.EventType', 'goog.ui.DragDropDetector.ImageDropEvent', 'goog.ui.DragDropDetector.LinkDropEvent'], ['goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('ui/drilldownrow.js', ['goog.ui.DrilldownRow'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.ui.Component'], false);
goog.addDependency('ui/drilldownrow_test.js', ['goog.ui.DrilldownRowTest'], ['goog.dom', 'goog.dom.TagName', 'goog.html.SafeHtml', 'goog.testing.jsunit', 'goog.ui.DrilldownRow'], false);
goog.addDependency('ui/editor/abstractdialog.js', ['goog.ui.editor.AbstractDialog', 'goog.ui.editor.AbstractDialog.Builder', 'goog.ui.editor.AbstractDialog.EventType'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventTarget', 'goog.string', 'goog.ui.Dialog', 'goog.ui.PopupBase'], false);
goog.addDependency('ui/editor/abstractdialog_test.js', ['goog.ui.editor.AbstractDialogTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.KeyCodes', 'goog.testing.MockControl', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.ui.editor.AbstractDialog', 'goog.userAgent'], false);
goog.addDependency('ui/editor/bubble.js', ['goog.ui.editor.Bubble'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.ViewportSizeMonitor', 'goog.dom.classlist', 'goog.editor.style', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.functions', 'goog.log', 'goog.math.Box', 'goog.object', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.PopupBase', 'goog.userAgent'], false);
goog.addDependency('ui/editor/bubble_test.js', ['goog.ui.editor.BubbleTest'], ['goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.positioning.Corner', 'goog.positioning.OverflowStatus', 'goog.string', 'goog.style', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.editor.Bubble', 'goog.userAgent.product'], false);
goog.addDependency('ui/editor/defaulttoolbar.js', ['goog.ui.editor.ButtonDescriptor', 'goog.ui.editor.DefaultToolbar'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.editor.Command', 'goog.style', 'goog.ui.editor.ToolbarFactory', 'goog.ui.editor.messages', 'goog.userAgent'], false);
goog.addDependency('ui/editor/linkdialog.js', ['goog.ui.editor.LinkDialog', 'goog.ui.editor.LinkDialog.BeforeTestLinkEvent', 'goog.ui.editor.LinkDialog.EventType', 'goog.ui.editor.LinkDialog.OkEvent'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.safe', 'goog.editor.BrowserFeature', 'goog.editor.Link', 'goog.editor.focus', 'goog.editor.node', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.InputHandler', 'goog.html.SafeHtml', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.LinkButtonRenderer', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.TabPane', 'goog.ui.editor.messages', 'goog.userAgent', 'goog.window'], false);
goog.addDependency('ui/editor/linkdialog_test.js', ['goog.ui.editor.LinkDialogTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Link', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.dom', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.LinkDialog', 'goog.ui.editor.messages', 'goog.userAgent'], false);
goog.addDependency('ui/editor/messages.js', ['goog.ui.editor.messages'], ['goog.html.uncheckedconversions', 'goog.string.Const'], false);
goog.addDependency('ui/editor/tabpane.js', ['goog.ui.editor.TabPane'], ['goog.asserts', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.Tab', 'goog.ui.TabBar'], false);
goog.addDependency('ui/editor/toolbarcontroller.js', ['goog.ui.editor.ToolbarController'], ['goog.editor.Field', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.ui.Component'], false);
goog.addDependency('ui/editor/toolbarfactory.js', ['goog.ui.editor.ToolbarFactory'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.Component', 'goog.ui.Container', 'goog.ui.Option', 'goog.ui.Toolbar', 'goog.ui.ToolbarButton', 'goog.ui.ToolbarColorMenuButton', 'goog.ui.ToolbarMenuButton', 'goog.ui.ToolbarRenderer', 'goog.ui.ToolbarSelect', 'goog.userAgent'], false);
goog.addDependency('ui/editor/toolbarfactory_test.js', ['goog.ui.editor.ToolbarFactoryTest'], ['goog.dom', 'goog.testing.ExpectedFailures', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.ui.editor.ToolbarFactory', 'goog.userAgent'], false);
goog.addDependency('ui/emoji/emoji.js', ['goog.ui.emoji.Emoji'], [], false);
goog.addDependency('ui/emoji/emojipalette.js', ['goog.ui.emoji.EmojiPalette'], ['goog.events.EventType', 'goog.net.ImageLoader', 'goog.ui.Palette', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPaletteRenderer'], false);
goog.addDependency('ui/emoji/emojipaletterenderer.js', ['goog.ui.emoji.EmojiPaletteRenderer'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.style', 'goog.ui.PaletteRenderer', 'goog.ui.emoji.Emoji'], false);
goog.addDependency('ui/emoji/emojipicker.js', ['goog.ui.emoji.EmojiPicker'], ['goog.dom.TagName', 'goog.style', 'goog.ui.Component', 'goog.ui.TabPane', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPalette', 'goog.ui.emoji.EmojiPaletteRenderer', 'goog.ui.emoji.ProgressiveEmojiPaletteRenderer'], false);
goog.addDependency('ui/emoji/emojipicker_test.js', ['goog.ui.emoji.EmojiPickerTest'], ['goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.style', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPicker', 'goog.ui.emoji.SpriteInfo'], false);
goog.addDependency('ui/emoji/fast_nonprogressive_emojipicker_test.js', ['goog.ui.emoji.FastNonProgressiveEmojiPickerTest'], ['goog.Promise', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.net.EventType', 'goog.style', 'goog.testing.jsunit', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPicker', 'goog.ui.emoji.SpriteInfo'], false);
goog.addDependency('ui/emoji/fast_progressive_emojipicker_test.js', ['goog.ui.emoji.FastProgressiveEmojiPickerTest'], ['goog.Promise', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.net.EventType', 'goog.style', 'goog.testing.jsunit', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPicker', 'goog.ui.emoji.SpriteInfo'], false);
goog.addDependency('ui/emoji/popupemojipicker.js', ['goog.ui.emoji.PopupEmojiPicker'], ['goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.ui.Component', 'goog.ui.Popup', 'goog.ui.emoji.EmojiPicker'], false);
goog.addDependency('ui/emoji/popupemojipicker_test.js', ['goog.ui.emoji.PopupEmojiPickerTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.ui.emoji.PopupEmojiPicker'], false);
goog.addDependency('ui/emoji/progressiveemojipaletterenderer.js', ['goog.ui.emoji.ProgressiveEmojiPaletteRenderer'], ['goog.dom.TagName', 'goog.style', 'goog.ui.emoji.EmojiPaletteRenderer'], false);
goog.addDependency('ui/emoji/spriteinfo.js', ['goog.ui.emoji.SpriteInfo'], [], false);
goog.addDependency('ui/emoji/spriteinfo_test.js', ['goog.ui.emoji.SpriteInfoTest'], ['goog.testing.jsunit', 'goog.ui.emoji.SpriteInfo'], false);
goog.addDependency('ui/filteredmenu.js', ['goog.ui.FilteredMenu'], ['goog.a11y.aria', 'goog.a11y.aria.AutoCompleteValues', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.object', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.FilterObservingMenuItem', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.userAgent'], false);
goog.addDependency('ui/filteredmenu_test.js', ['goog.ui.FilteredMenuTest'], ['goog.a11y.aria', 'goog.a11y.aria.AutoCompleteValues', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Rect', 'goog.style', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.FilteredMenu', 'goog.ui.MenuItem'], false);
goog.addDependency('ui/filterobservingmenuitem.js', ['goog.ui.FilterObservingMenuItem'], ['goog.ui.FilterObservingMenuItemRenderer', 'goog.ui.MenuItem', 'goog.ui.registry'], false);
goog.addDependency('ui/filterobservingmenuitemrenderer.js', ['goog.ui.FilterObservingMenuItemRenderer'], ['goog.ui.MenuItemRenderer'], false);
goog.addDependency('ui/flatbuttonrenderer.js', ['goog.ui.FlatButtonRenderer'], ['goog.a11y.aria.Role', 'goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry'], false);
goog.addDependency('ui/flatmenubuttonrenderer.js', ['goog.ui.FlatMenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.style', 'goog.ui.FlatButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/formpost.js', ['goog.ui.FormPost'], ['goog.array', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.ui.Component'], false);
goog.addDependency('ui/formpost_test.js', ['goog.ui.FormPostTest'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.object', 'goog.testing.jsunit', 'goog.ui.FormPost', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('ui/gauge.js', ['goog.ui.Gauge', 'goog.ui.GaugeColoredRange'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom.TagName', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.fx.easing', 'goog.graphics', 'goog.graphics.Font', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.math', 'goog.ui.Component', 'goog.ui.GaugeTheme'], false);
goog.addDependency('ui/gaugetheme.js', ['goog.ui.GaugeTheme'], ['goog.graphics.LinearGradient', 'goog.graphics.SolidFill', 'goog.graphics.Stroke'], false);
goog.addDependency('ui/hovercard.js', ['goog.ui.HoverCard', 'goog.ui.HoverCard.EventType', 'goog.ui.HoverCard.TriggerEvent'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.ui.AdvancedTooltip', 'goog.ui.PopupBase', 'goog.ui.Tooltip'], false);
goog.addDependency('ui/hovercard_test.js', ['goog.ui.HoverCardTest'], ['goog.dom', 'goog.events', 'goog.math.Coordinate', 'goog.style', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.ui.HoverCard'], false);
goog.addDependency('ui/hsvapalette.js', ['goog.ui.HsvaPalette'], ['goog.array', 'goog.color.alpha', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.HsvPalette'], false);
goog.addDependency('ui/hsvapalette_test.js', ['goog.ui.HsvaPaletteTest'], ['goog.color.alpha', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.Event', 'goog.math.Coordinate', 'goog.style', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.ui.HsvaPalette', 'goog.userAgent'], false);
goog.addDependency('ui/hsvpalette.js', ['goog.ui.HsvPalette'], ['goog.color', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.style', 'goog.style.bidi', 'goog.ui.Component', 'goog.userAgent'], false);
goog.addDependency('ui/hsvpalette_test.js', ['goog.ui.HsvPaletteTest'], ['goog.color', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.math.Coordinate', 'goog.style', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.HsvPalette', 'goog.userAgent'], false);
goog.addDependency('ui/idgenerator.js', ['goog.ui.IdGenerator'], [], false);
goog.addDependency('ui/idletimer.js', ['goog.ui.IdleTimer'], ['goog.Timer', 'goog.events', 'goog.events.EventTarget', 'goog.structs.Set', 'goog.ui.ActivityMonitor'], false);
goog.addDependency('ui/idletimer_test.js', ['goog.ui.IdleTimerTest'], ['goog.events', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.ui.IdleTimer', 'goog.ui.MockActivityMonitor'], false);
goog.addDependency('ui/iframemask.js', ['goog.ui.IframeMask'], ['goog.Disposable', 'goog.Timer', 'goog.dom', 'goog.dom.iframe', 'goog.events.EventHandler', 'goog.style'], false);
goog.addDependency('ui/iframemask_test.js', ['goog.ui.IframeMaskTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.iframe', 'goog.structs.Pool', 'goog.style', 'goog.testing.MockClock', 'goog.testing.StrictMock', 'goog.testing.jsunit', 'goog.ui.IframeMask', 'goog.ui.Popup', 'goog.ui.PopupBase', 'goog.userAgent'], false);
goog.addDependency('ui/imagelessbuttonrenderer.js', ['goog.ui.ImagelessButtonRenderer'], ['goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry'], false);
goog.addDependency('ui/imagelessmenubuttonrenderer.js', ['goog.ui.ImagelessMenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuButton', 'goog.ui.MenuButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/inputdatepicker.js', ['goog.ui.InputDatePicker'], ['goog.date.DateTime', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.string', 'goog.ui.Component', 'goog.ui.DatePicker', 'goog.ui.LabelInput', 'goog.ui.PopupBase', 'goog.ui.PopupDatePicker'], false);
goog.addDependency('ui/inputdatepicker_test.js', ['goog.ui.InputDatePickerTest'], ['goog.dom', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeParse', 'goog.testing.jsunit', 'goog.ui.InputDatePicker'], false);
goog.addDependency('ui/itemevent.js', ['goog.ui.ItemEvent'], ['goog.events.Event'], false);
goog.addDependency('ui/keyboardshortcuthandler.js', ['goog.ui.KeyboardShortcutEvent', 'goog.ui.KeyboardShortcutHandler', 'goog.ui.KeyboardShortcutHandler.EventType'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.dom.TagName', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyNames', 'goog.object', 'goog.userAgent'], false);
goog.addDependency('ui/keyboardshortcuthandler_test.js', ['goog.ui.KeyboardShortcutHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.KeyboardShortcutHandler', 'goog.userAgent'], false);
goog.addDependency('ui/labelinput.js', ['goog.ui.LabelInput'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.ui.Component', 'goog.userAgent'], false);
goog.addDependency('ui/labelinput_test.js', ['goog.ui.LabelInputTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventType', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.ui.LabelInput', 'goog.userAgent'], false);
goog.addDependency('ui/linkbuttonrenderer.js', ['goog.ui.LinkButtonRenderer'], ['goog.ui.Button', 'goog.ui.FlatButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/media/flashobject.js', ['goog.ui.media.FlashObject', 'goog.ui.media.FlashObject.ScriptAccessLevel', 'goog.ui.media.FlashObject.Wmodes'], ['goog.asserts', 'goog.dom.TagName', 'goog.dom.safe', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.html.flash', 'goog.html.legacyconversions', 'goog.log', 'goog.object', 'goog.string', 'goog.structs.Map', 'goog.style', 'goog.ui.Component', 'goog.userAgent', 'goog.userAgent.flash'], false);
goog.addDependency('ui/media/flashobject_test.js', ['goog.ui.media.FlashObjectTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.TagName', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.html.SafeUrl', 'goog.testing.MockControl', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.media.FlashObject', 'goog.userAgent'], false);
goog.addDependency('ui/media/flickr.js', ['goog.ui.media.FlickrSet', 'goog.ui.media.FlickrSetModel'], ['goog.html.TrustedResourceUrl', 'goog.string.Const', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/flickr_test.js', ['goog.ui.media.FlickrSetTest'], ['goog.dom', 'goog.dom.TagName', 'goog.html.testing', 'goog.testing.jsunit', 'goog.ui.media.FlashObject', 'goog.ui.media.FlickrSet', 'goog.ui.media.FlickrSetModel', 'goog.ui.media.Media'], false);
goog.addDependency('ui/media/googlevideo.js', ['goog.ui.media.GoogleVideo', 'goog.ui.media.GoogleVideoModel'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/googlevideo_test.js', ['goog.ui.media.GoogleVideoTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.media.FlashObject', 'goog.ui.media.GoogleVideo', 'goog.ui.media.GoogleVideoModel', 'goog.ui.media.Media'], false);
goog.addDependency('ui/media/media.js', ['goog.ui.media.Media', 'goog.ui.media.MediaRenderer'], ['goog.asserts', 'goog.dom.TagName', 'goog.style', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.ControlRenderer'], false);
goog.addDependency('ui/media/media_test.js', ['goog.ui.media.MediaTest'], ['goog.dom', 'goog.dom.TagName', 'goog.math.Size', 'goog.testing.jsunit', 'goog.ui.ControlRenderer', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/mediamodel.js', ['goog.ui.media.MediaModel', 'goog.ui.media.MediaModel.Category', 'goog.ui.media.MediaModel.Credit', 'goog.ui.media.MediaModel.Credit.Role', 'goog.ui.media.MediaModel.Credit.Scheme', 'goog.ui.media.MediaModel.Medium', 'goog.ui.media.MediaModel.MimeType', 'goog.ui.media.MediaModel.Player', 'goog.ui.media.MediaModel.SubTitle', 'goog.ui.media.MediaModel.Thumbnail'], ['goog.array', 'goog.html.TrustedResourceUrl', 'goog.html.legacyconversions'], false);
goog.addDependency('ui/media/mediamodel_test.js', ['goog.ui.media.MediaModelTest'], ['goog.testing.jsunit', 'goog.ui.media.MediaModel'], false);
goog.addDependency('ui/media/mp3.js', ['goog.ui.media.Mp3'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/mp3_test.js', ['goog.ui.media.Mp3Test'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.Mp3'], false);
goog.addDependency('ui/media/photo.js', ['goog.ui.media.Photo'], ['goog.dom.TagName', 'goog.ui.media.Media', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/photo_test.js', ['goog.ui.media.PhotoTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.media.MediaModel', 'goog.ui.media.Photo'], false);
goog.addDependency('ui/media/picasa.js', ['goog.ui.media.PicasaAlbum', 'goog.ui.media.PicasaAlbumModel'], ['goog.html.TrustedResourceUrl', 'goog.string.Const', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/picasa_test.js', ['goog.ui.media.PicasaTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.PicasaAlbum', 'goog.ui.media.PicasaAlbumModel'], false);
goog.addDependency('ui/media/vimeo.js', ['goog.ui.media.Vimeo', 'goog.ui.media.VimeoModel'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/vimeo_test.js', ['goog.ui.media.VimeoTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.Vimeo', 'goog.ui.media.VimeoModel'], false);
goog.addDependency('ui/media/youtube.js', ['goog.ui.media.Youtube', 'goog.ui.media.YoutubeModel'], ['goog.dom.TagName', 'goog.string', 'goog.ui.Component', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer'], false);
goog.addDependency('ui/media/youtube_test.js', ['goog.ui.media.YoutubeTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.media.FlashObject', 'goog.ui.media.Youtube', 'goog.ui.media.YoutubeModel'], false);
goog.addDependency('ui/menu.js', ['goog.ui.Menu', 'goog.ui.Menu.EventType'], ['goog.dom.TagName', 'goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.ui.Component.EventType', 'goog.ui.Component.State', 'goog.ui.Container', 'goog.ui.Container.Orientation', 'goog.ui.MenuHeader', 'goog.ui.MenuItem', 'goog.ui.MenuRenderer', 'goog.ui.MenuSeparator'], false);
goog.addDependency('ui/menu_test.js', ['goog.ui.MenuTest'], ['goog.dom', 'goog.events', 'goog.math.Coordinate', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.Menu'], false);
goog.addDependency('ui/menubar.js', ['goog.ui.menuBar'], ['goog.ui.Container', 'goog.ui.MenuBarRenderer'], false);
goog.addDependency('ui/menubardecorator.js', ['goog.ui.menuBarDecorator'], ['goog.ui.MenuBarRenderer', 'goog.ui.menuBar', 'goog.ui.registry'], false);
goog.addDependency('ui/menubarrenderer.js', ['goog.ui.MenuBarRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Container', 'goog.ui.ContainerRenderer'], false);
goog.addDependency('ui/menubase.js', ['goog.ui.MenuBase'], ['goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyHandler', 'goog.ui.Popup'], false);
goog.addDependency('ui/menubutton.js', ['goog.ui.MenuButton'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.math.Box', 'goog.math.Rect', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.positioning.Overflow', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.IdGenerator', 'goog.ui.Menu', 'goog.ui.MenuButtonRenderer', 'goog.ui.MenuItem', 'goog.ui.MenuRenderer', 'goog.ui.registry', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('ui/menubutton_test.js', ['goog.ui.MenuButtonTest'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.positioning.Overflow', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.SubMenu', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('ui/menubuttonrenderer.js', ['goog.ui.MenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.style', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.Menu', 'goog.ui.MenuRenderer'], false);
goog.addDependency('ui/menubuttonrenderer_test.js', ['goog.ui.MenuButtonRendererTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.MenuButton', 'goog.ui.MenuButtonRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/menuheader.js', ['goog.ui.MenuHeader'], ['goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuHeaderRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/menuheaderrenderer.js', ['goog.ui.MenuHeaderRenderer'], ['goog.ui.ControlRenderer'], false);
goog.addDependency('ui/menuitem.js', ['goog.ui.MenuItem'], ['goog.a11y.aria.Role', 'goog.array', 'goog.dom', 'goog.dom.classlist', 'goog.math.Coordinate', 'goog.string', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuItemRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/menuitem_test.js', ['goog.ui.MenuItemTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.KeyCodes', 'goog.math.Coordinate', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.MenuItemRenderer'], false);
goog.addDependency('ui/menuitemrenderer.js', ['goog.ui.MenuItemRenderer'], ['goog.a11y.aria.Role', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.Component', 'goog.ui.ControlRenderer'], false);
goog.addDependency('ui/menuitemrenderer_test.js', ['goog.ui.MenuItemRendererTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.classlist', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.MenuItemRenderer'], false);
goog.addDependency('ui/menurenderer.js', ['goog.ui.MenuRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.ui.ContainerRenderer', 'goog.ui.Separator'], false);
goog.addDependency('ui/menuseparator.js', ['goog.ui.MenuSeparator'], ['goog.ui.MenuSeparatorRenderer', 'goog.ui.Separator', 'goog.ui.registry'], false);
goog.addDependency('ui/menuseparatorrenderer.js', ['goog.ui.MenuSeparatorRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.ControlRenderer'], false);
goog.addDependency('ui/menuseparatorrenderer_test.js', ['goog.ui.MenuSeparatorRendererTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.ui.MenuSeparator', 'goog.ui.MenuSeparatorRenderer'], false);
goog.addDependency('ui/mockactivitymonitor.js', ['goog.ui.MockActivityMonitor'], ['goog.events.EventType', 'goog.ui.ActivityMonitor'], false);
goog.addDependency('ui/mockactivitymonitor_test.js', ['goog.ui.MockActivityMonitorTest'], ['goog.events', 'goog.functions', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.ActivityMonitor', 'goog.ui.MockActivityMonitor'], false);
goog.addDependency('ui/modalariavisibilityhelper.js', ['goog.ui.ModalAriaVisibilityHelper'], ['goog.a11y.aria', 'goog.a11y.aria.State'], false);
goog.addDependency('ui/modalariavisibilityhelper_test.js', ['goog.ui.ModalAriaVisibilityHelperTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.string', 'goog.testing.jsunit', 'goog.ui.ModalAriaVisibilityHelper'], false);
goog.addDependency('ui/modalpopup.js', ['goog.ui.ModalPopup'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.dom.iframe', 'goog.events', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.fx.Transition', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.ModalAriaVisibilityHelper', 'goog.ui.PopupBase', 'goog.userAgent'], false);
goog.addDependency('ui/modalpopup_test.js', ['goog.ui.ModalPopupTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dispose', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventTarget', 'goog.fx.Transition', 'goog.fx.css3', 'goog.string', 'goog.style', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.ui.ModalPopup', 'goog.ui.PopupBase'], false);
goog.addDependency('ui/nativebuttonrenderer.js', ['goog.ui.NativeButtonRenderer'], ['goog.asserts', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventType', 'goog.ui.ButtonRenderer', 'goog.ui.Component'], false);
goog.addDependency('ui/nativebuttonrenderer_test.js', ['goog.ui.NativeButtonRendererTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.testing.ExpectedFailures', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.NativeButtonRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/option.js', ['goog.ui.Option'], ['goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.registry'], false);
goog.addDependency('ui/palette.js', ['goog.ui.Palette'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Size', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.PaletteRenderer', 'goog.ui.SelectionModel'], false);
goog.addDependency('ui/palette_test.js', ['goog.ui.PaletteTest'], ['goog.a11y.aria', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyEvent', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.Component', 'goog.ui.Container', 'goog.ui.Palette'], false);
goog.addDependency('ui/paletterenderer.js', ['goog.ui.PaletteRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeIterator', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.iter', 'goog.style', 'goog.ui.ControlRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/paletterenderer_test.js', ['goog.ui.PaletteRendererTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit', 'goog.ui.Palette', 'goog.ui.PaletteRenderer'], false);
goog.addDependency('ui/plaintextspellchecker.js', ['goog.ui.PlainTextSpellChecker'], ['goog.Timer', 'goog.a11y.aria', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.spell.SpellCheck', 'goog.style', 'goog.ui.AbstractSpellChecker', 'goog.ui.Component', 'goog.userAgent'], false);
goog.addDependency('ui/plaintextspellchecker_test.js', ['goog.ui.PlainTextSpellCheckerTest'], ['goog.Timer', 'goog.dom', 'goog.events.KeyCodes', 'goog.spell.SpellCheck', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.PlainTextSpellChecker'], false);
goog.addDependency('ui/popup.js', ['goog.ui.Popup'], ['goog.math.Box', 'goog.positioning.Corner', 'goog.style', 'goog.ui.PopupBase'], false);
goog.addDependency('ui/popup_test.js', ['goog.ui.PopupTest'], ['goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.style', 'goog.testing.jsunit', 'goog.ui.Popup', 'goog.userAgent'], false);
goog.addDependency('ui/popupbase.js', ['goog.ui.PopupBase', 'goog.ui.PopupBase.EventType', 'goog.ui.PopupBase.Type'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Transition', 'goog.style', 'goog.userAgent'], false);
goog.addDependency('ui/popupbase_test.js', ['goog.ui.PopupBaseTest'], ['goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Transition', 'goog.fx.css3', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.ui.PopupBase'], false);
goog.addDependency('ui/popupcolorpicker.js', ['goog.ui.PopupColorPicker'], ['goog.asserts', 'goog.dom.classlist', 'goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.ui.ColorPicker', 'goog.ui.Component', 'goog.ui.Popup'], false);
goog.addDependency('ui/popupcolorpicker_test.js', ['goog.ui.PopupColorPickerTest'], ['goog.dom', 'goog.events', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.ColorPicker', 'goog.ui.PopupColorPicker'], false);
goog.addDependency('ui/popupdatepicker.js', ['goog.ui.PopupDatePicker'], ['goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.style', 'goog.ui.Component', 'goog.ui.DatePicker', 'goog.ui.Popup', 'goog.ui.PopupBase'], false);
goog.addDependency('ui/popupdatepicker_test.js', ['goog.ui.PopupDatePickerTest'], ['goog.date.Date', 'goog.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.PopupBase', 'goog.ui.PopupDatePicker'], false);
goog.addDependency('ui/popupmenu.js', ['goog.ui.PopupMenu'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.positioning.Overflow', 'goog.positioning.ViewportClientPosition', 'goog.structs.Map', 'goog.style', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.PopupBase', 'goog.userAgent'], false);
goog.addDependency('ui/popupmenu_test.js', ['goog.ui.PopupMenuTest'], ['goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Box', 'goog.math.Coordinate', 'goog.positioning.Corner', 'goog.style', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.PopupMenu'], false);
goog.addDependency('ui/progressbar.js', ['goog.ui.ProgressBar', 'goog.ui.ProgressBar.Orientation'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.ui.Component', 'goog.ui.RangeModel', 'goog.userAgent'], false);
goog.addDependency('ui/prompt.js', ['goog.ui.Prompt'], ['goog.Timer', 'goog.dom', 'goog.dom.InputType', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.functions', 'goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.ui.Component', 'goog.ui.Dialog', 'goog.userAgent'], false);
goog.addDependency('ui/prompt_test.js', ['goog.ui.PromptTest'], ['goog.dom.selection', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.functions', 'goog.string', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.BidiInput', 'goog.ui.Dialog', 'goog.ui.Prompt', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('ui/rangemodel.js', ['goog.ui.RangeModel'], ['goog.events.EventTarget', 'goog.ui.Component'], false);
goog.addDependency('ui/rangemodel_test.js', ['goog.ui.RangeModelTest'], ['goog.testing.jsunit', 'goog.ui.RangeModel'], false);
goog.addDependency('ui/ratings.js', ['goog.ui.Ratings', 'goog.ui.Ratings.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventType', 'goog.ui.Component'], false);
goog.addDependency('ui/registry.js', ['goog.ui.registry'], ['goog.asserts', 'goog.dom.classlist'], false);
goog.addDependency('ui/registry_test.js', ['goog.ui.registryTest'], ['goog.object', 'goog.testing.jsunit', 'goog.ui.registry'], false);
goog.addDependency('ui/richtextspellchecker.js', ['goog.ui.RichTextSpellChecker'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.math.Coordinate', 'goog.spell.SpellCheck', 'goog.string.StringBuffer', 'goog.style', 'goog.ui.AbstractSpellChecker', 'goog.ui.Component', 'goog.ui.PopupMenu'], false);
goog.addDependency('ui/richtextspellchecker_test.js', ['goog.ui.RichTextSpellCheckerTest'], ['goog.dom.Range', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.KeyCodes', 'goog.object', 'goog.spell.SpellCheck', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.RichTextSpellChecker'], false);
goog.addDependency('ui/roundedpanel.js', ['goog.ui.BaseRoundedPanel', 'goog.ui.CssRoundedPanel', 'goog.ui.GraphicsRoundedPanel', 'goog.ui.RoundedPanel', 'goog.ui.RoundedPanel.Corner'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.graphics', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.Stroke', 'goog.math', 'goog.math.Coordinate', 'goog.style', 'goog.ui.Component', 'goog.userAgent'], false);
goog.addDependency('ui/roundedpanel_test.js', ['goog.ui.RoundedPanelTest'], ['goog.testing.jsunit', 'goog.ui.CssRoundedPanel', 'goog.ui.GraphicsRoundedPanel', 'goog.ui.RoundedPanel', 'goog.userAgent'], false);
goog.addDependency('ui/roundedtabrenderer.js', ['goog.ui.RoundedTabRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.ui.Tab', 'goog.ui.TabBar', 'goog.ui.TabRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/scrollfloater.js', ['goog.ui.ScrollFloater', 'goog.ui.ScrollFloater.EventType'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.userAgent'], false);
goog.addDependency('ui/scrollfloater_test.js', ['goog.ui.ScrollFloaterTest'], ['goog.dom', 'goog.events', 'goog.style', 'goog.testing.jsunit', 'goog.ui.ScrollFloater'], false);
goog.addDependency('ui/select.js', ['goog.ui.Select'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.events.EventType', 'goog.ui.Component', 'goog.ui.IdGenerator', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.MenuRenderer', 'goog.ui.SelectionModel', 'goog.ui.registry'], false);
goog.addDependency('ui/select_test.js', ['goog.ui.SelectTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.Select', 'goog.ui.Separator'], false);
goog.addDependency('ui/selectionmenubutton.js', ['goog.ui.SelectionMenuButton', 'goog.ui.SelectionMenuButton.SelectionState'], ['goog.dom.InputType', 'goog.dom.TagName', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.registry'], false);
goog.addDependency('ui/selectionmenubutton_test.js', ['goog.ui.SelectionMenuButtonTest'], ['goog.dom', 'goog.events', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.SelectionMenuButton'], false);
goog.addDependency('ui/selectionmodel.js', ['goog.ui.SelectionModel'], ['goog.array', 'goog.events.EventTarget', 'goog.events.EventType'], false);
goog.addDependency('ui/selectionmodel_test.js', ['goog.ui.SelectionModelTest'], ['goog.array', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.SelectionModel'], false);
goog.addDependency('ui/separator.js', ['goog.ui.Separator'], ['goog.a11y.aria', 'goog.asserts', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuSeparatorRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/serverchart.js', ['goog.ui.ServerChart', 'goog.ui.ServerChart.AxisDisplayType', 'goog.ui.ServerChart.ChartType', 'goog.ui.ServerChart.EncodingType', 'goog.ui.ServerChart.Event', 'goog.ui.ServerChart.LegendPosition', 'goog.ui.ServerChart.MaximumValue', 'goog.ui.ServerChart.MultiAxisAlignment', 'goog.ui.ServerChart.MultiAxisType', 'goog.ui.ServerChart.UriParam', 'goog.ui.ServerChart.UriTooLongEvent'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.dom.TagName', 'goog.events.Event', 'goog.string', 'goog.ui.Component'], false);
goog.addDependency('ui/serverchart_test.js', ['goog.ui.ServerChartTest'], ['goog.Uri', 'goog.events', 'goog.testing.jsunit', 'goog.ui.ServerChart'], false);
goog.addDependency('ui/slider.js', ['goog.ui.Slider', 'goog.ui.Slider.Orientation'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.dom.TagName', 'goog.ui.SliderBase'], false);
goog.addDependency('ui/sliderbase.js', ['goog.ui.SliderBase', 'goog.ui.SliderBase.AnimationFactory', 'goog.ui.SliderBase.Orientation'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.events.MouseWheelHandler', 'goog.functions', 'goog.fx.AnimationParallelQueue', 'goog.fx.Dragger', 'goog.fx.Transition', 'goog.fx.dom.ResizeHeight', 'goog.fx.dom.ResizeWidth', 'goog.fx.dom.Slide', 'goog.math', 'goog.math.Coordinate', 'goog.style', 'goog.style.bidi', 'goog.ui.Component', 'goog.ui.RangeModel'], false);
goog.addDependency('ui/sliderbase_test.js', ['goog.ui.SliderBaseTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Animation', 'goog.math.Coordinate', 'goog.style', 'goog.style.bidi', 'goog.testing.MockClock', 'goog.testing.MockControl', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.testing.recordFunction', 'goog.ui.Component', 'goog.ui.SliderBase', 'goog.userAgent'], false);
goog.addDependency('ui/splitbehavior.js', ['goog.ui.SplitBehavior', 'goog.ui.SplitBehavior.DefaultHandlers'], ['goog.Disposable', 'goog.asserts', 'goog.dispose', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.decorate', 'goog.ui.registry'], false);
goog.addDependency('ui/splitbehavior_test.js', ['goog.ui.SplitBehaviorTest'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.Event', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.CustomButton', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.SplitBehavior', 'goog.ui.decorate'], false);
goog.addDependency('ui/splitpane.js', ['goog.ui.SplitPane', 'goog.ui.SplitPane.Orientation'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Rect', 'goog.math.Size', 'goog.style', 'goog.ui.Component', 'goog.userAgent'], false);
goog.addDependency('ui/splitpane_test.js', ['goog.ui.SplitPaneTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.math.Size', 'goog.style', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.Component', 'goog.ui.SplitPane'], false);
goog.addDependency('ui/style/app/buttonrenderer.js', ['goog.ui.style.app.ButtonRenderer'], ['goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.Button', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry'], false);
goog.addDependency('ui/style/app/buttonrenderer_test.js', ['goog.ui.style.app.ButtonRendererTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.testing.ui.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.style.app.ButtonRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/style/app/menubuttonrenderer.js', ['goog.ui.style.app.MenuButtonRenderer'], ['goog.a11y.aria.Role', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.style', 'goog.ui.Menu', 'goog.ui.MenuRenderer', 'goog.ui.style.app.ButtonRenderer'], false);
goog.addDependency('ui/style/app/menubuttonrenderer_test.js', ['goog.ui.style.app.MenuButtonRendererTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.testing.ui.style', 'goog.ui.Component', 'goog.ui.MenuButton', 'goog.ui.style.app.MenuButtonRenderer'], false);
goog.addDependency('ui/style/app/primaryactionbuttonrenderer.js', ['goog.ui.style.app.PrimaryActionButtonRenderer'], ['goog.ui.Button', 'goog.ui.registry', 'goog.ui.style.app.ButtonRenderer'], false);
goog.addDependency('ui/style/app/primaryactionbuttonrenderer_test.js', ['goog.ui.style.app.PrimaryActionButtonRendererTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.testing.ui.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.style.app.PrimaryActionButtonRenderer'], false);
goog.addDependency('ui/submenu.js', ['goog.ui.SubMenu'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.KeyCodes', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.style', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.SubMenuRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/submenu_test.js', ['goog.ui.SubMenuTest'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.functions', 'goog.positioning', 'goog.positioning.Overflow', 'goog.style', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.SubMenu', 'goog.ui.SubMenuRenderer'], false);
goog.addDependency('ui/submenurenderer.js', ['goog.ui.SubMenuRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.style', 'goog.ui.Menu', 'goog.ui.MenuItemRenderer'], false);
goog.addDependency('ui/tab.js', ['goog.ui.Tab'], ['goog.ui.Component', 'goog.ui.Control', 'goog.ui.TabRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/tab_test.js', ['goog.ui.TabTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.Tab', 'goog.ui.TabRenderer'], false);
goog.addDependency('ui/tabbar.js', ['goog.ui.TabBar', 'goog.ui.TabBar.Location'], ['goog.ui.Component.EventType', 'goog.ui.Container', 'goog.ui.Container.Orientation', 'goog.ui.Tab', 'goog.ui.TabBarRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/tabbar_test.js', ['goog.ui.TabBarTest'], ['goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.Container', 'goog.ui.Tab', 'goog.ui.TabBar', 'goog.ui.TabBarRenderer'], false);
goog.addDependency('ui/tabbarrenderer.js', ['goog.ui.TabBarRenderer'], ['goog.a11y.aria.Role', 'goog.object', 'goog.ui.ContainerRenderer'], false);
goog.addDependency('ui/tabbarrenderer_test.js', ['goog.ui.TabBarRendererTest'], ['goog.a11y.aria.Role', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.Container', 'goog.ui.TabBar', 'goog.ui.TabBarRenderer'], false);
goog.addDependency('ui/tablesorter.js', ['goog.ui.TableSorter', 'goog.ui.TableSorter.EventType'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventType', 'goog.functions', 'goog.ui.Component'], false);
goog.addDependency('ui/tablesorter_test.js', ['goog.ui.TableSorterTest'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.TableSorter'], false);
goog.addDependency('ui/tabpane.js', ['goog.ui.TabPane', 'goog.ui.TabPane.Events', 'goog.ui.TabPane.TabLocation', 'goog.ui.TabPane.TabPage', 'goog.ui.TabPaneEvent'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style'], false);
goog.addDependency('ui/tabpane_test.js', ['goog.ui.TabPaneTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.ui.TabPane'], false);
goog.addDependency('ui/tabrenderer.js', ['goog.ui.TabRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Component', 'goog.ui.ControlRenderer'], false);
goog.addDependency('ui/tabrenderer_test.js', ['goog.ui.TabRendererTest'], ['goog.a11y.aria.Role', 'goog.dom', 'goog.dom.classlist', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.Tab', 'goog.ui.TabRenderer'], false);
goog.addDependency('ui/textarea.js', ['goog.ui.Textarea', 'goog.ui.Textarea.EventType'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventType', 'goog.style', 'goog.ui.Control', 'goog.ui.TextareaRenderer', 'goog.userAgent'], false);
goog.addDependency('ui/textarea_test.js', ['goog.ui.TextareaTest'], ['goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.events.EventObserver', 'goog.testing.jsunit', 'goog.ui.Textarea', 'goog.ui.TextareaRenderer', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('ui/textarearenderer.js', ['goog.ui.TextareaRenderer'], ['goog.dom.TagName', 'goog.ui.Component', 'goog.ui.ControlRenderer'], false);
goog.addDependency('ui/togglebutton.js', ['goog.ui.ToggleButton'], ['goog.ui.Button', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/toolbar.js', ['goog.ui.Toolbar'], ['goog.ui.Container', 'goog.ui.ToolbarRenderer'], false);
goog.addDependency('ui/toolbar_test.js', ['goog.ui.ToolbarTest'], ['goog.a11y.aria', 'goog.dom', 'goog.events.EventType', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.ui.Toolbar', 'goog.ui.ToolbarMenuButton'], false);
goog.addDependency('ui/toolbarbutton.js', ['goog.ui.ToolbarButton'], ['goog.ui.Button', 'goog.ui.ToolbarButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/toolbarbuttonrenderer.js', ['goog.ui.ToolbarButtonRenderer'], ['goog.ui.CustomButtonRenderer'], false);
goog.addDependency('ui/toolbarcolormenubutton.js', ['goog.ui.ToolbarColorMenuButton'], ['goog.ui.ColorMenuButton', 'goog.ui.ToolbarColorMenuButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/toolbarcolormenubuttonrenderer.js', ['goog.ui.ToolbarColorMenuButtonRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.ui.ColorMenuButtonRenderer', 'goog.ui.MenuButtonRenderer', 'goog.ui.ToolbarMenuButtonRenderer'], false);
goog.addDependency('ui/toolbarcolormenubuttonrenderer_test.js', ['goog.ui.ToolbarColorMenuButtonRendererTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.testing.ui.RendererHarness', 'goog.testing.ui.rendererasserts', 'goog.ui.ToolbarColorMenuButton', 'goog.ui.ToolbarColorMenuButtonRenderer'], false);
goog.addDependency('ui/toolbarmenubutton.js', ['goog.ui.ToolbarMenuButton'], ['goog.ui.MenuButton', 'goog.ui.ToolbarMenuButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/toolbarmenubuttonrenderer.js', ['goog.ui.ToolbarMenuButtonRenderer'], ['goog.ui.MenuButtonRenderer'], false);
goog.addDependency('ui/toolbarrenderer.js', ['goog.ui.ToolbarRenderer'], ['goog.a11y.aria.Role', 'goog.dom.TagName', 'goog.ui.Container', 'goog.ui.ContainerRenderer', 'goog.ui.Separator', 'goog.ui.ToolbarSeparatorRenderer'], false);
goog.addDependency('ui/toolbarselect.js', ['goog.ui.ToolbarSelect'], ['goog.ui.Select', 'goog.ui.ToolbarMenuButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/toolbarseparator.js', ['goog.ui.ToolbarSeparator'], ['goog.ui.Separator', 'goog.ui.ToolbarSeparatorRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/toolbarseparatorrenderer.js', ['goog.ui.ToolbarSeparatorRenderer'], ['goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuSeparatorRenderer'], false);
goog.addDependency('ui/toolbarseparatorrenderer_test.js', ['goog.ui.ToolbarSeparatorRendererTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.ToolbarSeparator', 'goog.ui.ToolbarSeparatorRenderer'], false);
goog.addDependency('ui/toolbartogglebutton.js', ['goog.ui.ToolbarToggleButton'], ['goog.ui.ToggleButton', 'goog.ui.ToolbarButtonRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/tooltip.js', ['goog.ui.Tooltip', 'goog.ui.Tooltip.CursorTooltipPosition', 'goog.ui.Tooltip.ElementTooltipPosition', 'goog.ui.Tooltip.State'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.safe', 'goog.events', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.html.legacyconversions', 'goog.math.Box', 'goog.math.Coordinate', 'goog.positioning', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.positioning.ViewportPosition', 'goog.structs.Set', 'goog.style', 'goog.ui.Popup', 'goog.ui.PopupBase'], false);
goog.addDependency('ui/tooltip_test.js', ['goog.ui.TooltipTest'], ['goog.dom', 'goog.dom.TagName', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.html.testing', 'goog.math.Coordinate', 'goog.positioning.AbsolutePosition', 'goog.style', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.TestQueue', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.PopupBase', 'goog.ui.Tooltip', 'goog.userAgent'], false);
goog.addDependency('ui/tree/basenode.js', ['goog.ui.tree.BaseNode', 'goog.ui.tree.BaseNode.EventType'], ['goog.Timer', 'goog.a11y.aria', 'goog.asserts', 'goog.dom.safe', 'goog.events.Event', 'goog.events.KeyCodes', 'goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.legacyconversions', 'goog.string', 'goog.string.StringBuffer', 'goog.style', 'goog.ui.Component'], false);
goog.addDependency('ui/tree/basenode_test.js', ['goog.ui.tree.BaseNodeTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.html.legacyconversions', 'goog.html.testing', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.ui.Component', 'goog.ui.tree.BaseNode', 'goog.ui.tree.TreeControl', 'goog.ui.tree.TreeNode'], false);
goog.addDependency('ui/tree/treecontrol.js', ['goog.ui.tree.TreeControl'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom.classlist', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.events.KeyHandler', 'goog.html.SafeHtml', 'goog.log', 'goog.ui.tree.BaseNode', 'goog.ui.tree.TreeNode', 'goog.ui.tree.TypeAhead', 'goog.userAgent'], false);
goog.addDependency('ui/tree/treecontrol_test.js', ['goog.ui.tree.TreeControlTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.ui.tree.TreeControl'], false);
goog.addDependency('ui/tree/treenode.js', ['goog.ui.tree.TreeNode'], ['goog.ui.tree.BaseNode'], false);
goog.addDependency('ui/tree/typeahead.js', ['goog.ui.tree.TypeAhead', 'goog.ui.tree.TypeAhead.Offset'], ['goog.array', 'goog.events.KeyCodes', 'goog.string', 'goog.structs.Trie'], false);
goog.addDependency('ui/tree/typeahead_test.js', ['goog.ui.tree.TypeAheadTest'], ['goog.dom', 'goog.events.KeyCodes', 'goog.testing.jsunit', 'goog.ui.tree.TreeControl', 'goog.ui.tree.TypeAhead'], false);
goog.addDependency('ui/tristatemenuitem.js', ['goog.ui.TriStateMenuItem', 'goog.ui.TriStateMenuItem.State'], ['goog.dom.classlist', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.TriStateMenuItemRenderer', 'goog.ui.registry'], false);
goog.addDependency('ui/tristatemenuitemrenderer.js', ['goog.ui.TriStateMenuItemRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.ui.MenuItemRenderer'], false);
goog.addDependency('ui/twothumbslider.js', ['goog.ui.TwoThumbSlider'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.dom.TagName', 'goog.ui.SliderBase'], false);
goog.addDependency('ui/twothumbslider_test.js', ['goog.ui.TwoThumbSliderTest'], ['goog.testing.jsunit', 'goog.ui.SliderBase', 'goog.ui.TwoThumbSlider'], false);
goog.addDependency('ui/zippy.js', ['goog.ui.Zippy', 'goog.ui.Zippy.Events', 'goog.ui.ZippyEvent'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.classlist', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style'], false);
goog.addDependency('ui/zippy_test.js', ['goog.ui.ZippyTest'], ['goog.a11y.aria', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events', 'goog.object', 'goog.testing.events', 'goog.testing.jsunit', 'goog.ui.Zippy'], false);
goog.addDependency('uri/uri.js', ['goog.Uri', 'goog.Uri.QueryData'], ['goog.array', 'goog.string', 'goog.structs', 'goog.structs.Map', 'goog.uri.utils', 'goog.uri.utils.ComponentIndex', 'goog.uri.utils.StandardQueryParam'], false);
goog.addDependency('uri/uri_test.js', ['goog.UriTest'], ['goog.Uri', 'goog.testing.jsunit'], false);
goog.addDependency('uri/utils.js', ['goog.uri.utils', 'goog.uri.utils.ComponentIndex', 'goog.uri.utils.QueryArray', 'goog.uri.utils.QueryValue', 'goog.uri.utils.StandardQueryParam'], ['goog.asserts', 'goog.string'], false);
goog.addDependency('uri/utils_test.js', ['goog.uri.utilsTest'], ['goog.functions', 'goog.string', 'goog.testing.jsunit', 'goog.uri.utils'], false);
goog.addDependency('useragent/adobereader.js', ['goog.userAgent.adobeReader'], ['goog.string', 'goog.userAgent'], false);
goog.addDependency('useragent/adobereader_test.js', ['goog.userAgent.adobeReaderTest'], ['goog.testing.jsunit', 'goog.userAgent.adobeReader'], false);
goog.addDependency('useragent/flash.js', ['goog.userAgent.flash'], ['goog.string'], false);
goog.addDependency('useragent/flash_test.js', ['goog.userAgent.flashTest'], ['goog.testing.jsunit', 'goog.userAgent.flash'], false);
goog.addDependency('useragent/iphoto.js', ['goog.userAgent.iphoto'], ['goog.string', 'goog.userAgent'], false);
goog.addDependency('useragent/jscript.js', ['goog.userAgent.jscript'], ['goog.string'], false);
goog.addDependency('useragent/jscript_test.js', ['goog.userAgent.jscriptTest'], ['goog.testing.jsunit', 'goog.userAgent.jscript'], false);
goog.addDependency('useragent/keyboard.js', ['goog.userAgent.keyboard'], ['goog.labs.userAgent.platform'], false);
goog.addDependency('useragent/keyboard_test.js', ['goog.userAgent.keyboardTest'], ['goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.MockUserAgent', 'goog.testing.jsunit', 'goog.userAgent.keyboard', 'goog.userAgentTestUtil'], false);
goog.addDependency('useragent/platform.js', ['goog.userAgent.platform'], ['goog.string', 'goog.userAgent'], false);
goog.addDependency('useragent/platform_test.js', ['goog.userAgent.platformTest'], ['goog.testing.MockUserAgent', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.platform', 'goog.userAgentTestUtil'], false);
goog.addDependency('useragent/product.js', ['goog.userAgent.product'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.platform', 'goog.userAgent'], false);
goog.addDependency('useragent/product_isversion.js', ['goog.userAgent.product.isVersion'], ['goog.labs.userAgent.platform', 'goog.string', 'goog.userAgent', 'goog.userAgent.product'], false);
goog.addDependency('useragent/product_test.js', ['goog.userAgent.productTest'], ['goog.array', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.MockUserAgent', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion', 'goog.userAgentTestUtil'], false);
goog.addDependency('useragent/useragent.js', ['goog.userAgent'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.engine', 'goog.labs.userAgent.platform', 'goog.labs.userAgent.util', 'goog.string'], false);
goog.addDependency('useragent/useragent_quirks_test.js', ['goog.userAgentQuirksTest'], ['goog.testing.jsunit', 'goog.userAgent'], false);
goog.addDependency('useragent/useragent_test.js', ['goog.userAgentTest'], ['goog.array', 'goog.labs.userAgent.platform', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgentTestUtil'], false);
goog.addDependency('useragent/useragenttestutil.js', ['goog.userAgentTestUtil', 'goog.userAgentTestUtil.UserAgents'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.engine', 'goog.labs.userAgent.platform', 'goog.userAgent', 'goog.userAgent.keyboard', 'goog.userAgent.platform', 'goog.userAgent.product', 'goog.userAgent.product.isVersion'], false);
goog.addDependency('vec/float32array.js', ['goog.vec.Float32Array'], [], false);
goog.addDependency('vec/float64array.js', ['goog.vec.Float64Array'], [], false);
goog.addDependency('vec/mat3.js', ['goog.vec.Mat3'], ['goog.vec'], false);
goog.addDependency('vec/mat3d.js', ['goog.vec.mat3d', 'goog.vec.mat3d.Type'], ['goog.vec'], false);
goog.addDependency('vec/mat3f.js', ['goog.vec.mat3f', 'goog.vec.mat3f.Type'], ['goog.vec'], false);
goog.addDependency('vec/mat4.js', ['goog.vec.Mat4'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4'], false);
goog.addDependency('vec/mat4d.js', ['goog.vec.mat4d', 'goog.vec.mat4d.Type'], ['goog.vec', 'goog.vec.Quaternion', 'goog.vec.vec3d', 'goog.vec.vec4d'], false);
goog.addDependency('vec/mat4f.js', ['goog.vec.mat4f', 'goog.vec.mat4f.Type'], ['goog.vec', 'goog.vec.Quaternion', 'goog.vec.vec3f', 'goog.vec.vec4f'], false);
goog.addDependency('vec/matrix3.js', ['goog.vec.Matrix3'], [], false);
goog.addDependency('vec/matrix4.js', ['goog.vec.Matrix4'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4'], false);
goog.addDependency('vec/quaternion.js', ['goog.vec.Quaternion', 'goog.vec.Quaternion.AnyType'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4'], false);
goog.addDependency('vec/ray.js', ['goog.vec.Ray'], ['goog.vec.Vec3'], false);
goog.addDependency('vec/vec.js', ['goog.vec', 'goog.vec.AnyType', 'goog.vec.ArrayType', 'goog.vec.Float32', 'goog.vec.Float64', 'goog.vec.Number'], ['goog.vec.Float32Array', 'goog.vec.Float64Array'], false);
goog.addDependency('vec/vec2.js', ['goog.vec.Vec2'], ['goog.vec'], false);
goog.addDependency('vec/vec2d.js', ['goog.vec.vec2d', 'goog.vec.vec2d.Type'], ['goog.vec'], false);
goog.addDependency('vec/vec2f.js', ['goog.vec.vec2f', 'goog.vec.vec2f.Type'], ['goog.vec'], false);
goog.addDependency('vec/vec3.js', ['goog.vec.Vec3'], ['goog.vec'], false);
goog.addDependency('vec/vec3d.js', ['goog.vec.vec3d', 'goog.vec.vec3d.Type'], ['goog.vec'], false);
goog.addDependency('vec/vec3f.js', ['goog.vec.vec3f', 'goog.vec.vec3f.Type'], ['goog.vec'], false);
goog.addDependency('vec/vec4.js', ['goog.vec.Vec4'], ['goog.vec'], false);
goog.addDependency('vec/vec4d.js', ['goog.vec.vec4d', 'goog.vec.vec4d.Type'], ['goog.vec'], false);
goog.addDependency('vec/vec4f.js', ['goog.vec.vec4f', 'goog.vec.vec4f.Type'], ['goog.vec'], false);
goog.addDependency('webgl/webgl.js', ['goog.webgl'], [], false);
goog.addDependency('window/window.js', ['goog.window'], ['goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeUrl', 'goog.html.uncheckedconversions', 'goog.labs.userAgent.platform', 'goog.string', 'goog.string.Const', 'goog.userAgent'], false);
goog.addDependency('window/window_test.js', ['goog.windowTest'], ['goog.Promise', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.functions', 'goog.labs.userAgent.browser', 'goog.labs.userAgent.engine', 'goog.labs.userAgent.platform', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit', 'goog.window'], false);

//analytics/devrel/demos/enhancedecommerce/javascript/cart-db.js
/**
 * @fileoverview CartDB, cart database that uses cookies for storage. Keys are
 * the product ids and values are a json array of products that have that id.
 */
goog.provide('ec.CartDB');

/**
 * @param {Array.<Object>} items The full item list.
 * @constructor
 */
ec.CartDB = function(items) {
  this.items = $.extend(true, {}, items);
  this.itemDict = {};
  var that = this;
  $.each(this.items, function(index, value) {
    that.itemDict[value.id] = value;
  });

  this.defaultColor = 'red';
  this.defaultSize = 'M';

  this.prefix = 'ic';
  this.version = 2;
  this.clearCart(this.version - 1);
};

/**
 * Create a versioned database id
 * @param {string} id The id to change.
 * @return {string} the database id.
 */
ec.CartDB.prototype.getDBId = function(id) {
  return this.prefix + this.version + '-' + id;
};

/**
 * Checks whether an id is a valid database id.
 * @param {string} id The id to check.
 * @return {boolean} whether the id is a database id.
 */
ec.CartDB.prototype.isDBId = function(id) {
  var valid = !!id;
  return valid && id.split('-').length > 1 &&
      id.split('-')[0].substr(0, this.prefix.length) == this.prefix;
};

/**
 * Gets the item list corresponding to the given item id.
 * @param {string} id The id of the item to get.
 * @return {Array.<Object>} the list of items from the db.
 */
ec.CartDB.prototype.getItem = function(id) {
  var dbId = this.getDBId(id);
  return localStorage.getItem(dbId) ?
      JSON.parse(localStorage.getItem(dbId)) : [];
};

/**
 * Sets the item list for the item id. If there is only one item with quantity 0
 * then remove the entry.
 * @param {string} id The id of the item to set.
 * @param {Array.<Object>} itemList The list of items to store.
 */
ec.CartDB.prototype.setItem = function(id, itemList) {
  var dbId = this.getDBId(id);
  if (itemList.length == 1 && itemList[0].quantity == 0) {
    localStorage.removeItem(dbId);
  } else {
    localStorage.setItem(dbId, JSON.stringify(itemList));
  }
};

/**
 * Adds an item to the cart db.
 * @param {string} id The id of the item to set.
 * @param {string} variant The color variant of the item.
 * @param {string} size The size of the item.
 * @return {Object} The item that was added to the cart.
 */
ec.CartDB.prototype.addCartItem = function(id, variant, size) {
  if (!this.itemDict[id]) { return;}
  variant = variant || this.defaultColor;
  size = size || this.defaultSize;
  var items = this.getItem(id);
  var itemInCart = false;
  var newQuantity = 1;
  $.each(items, function(index, value) {
    if (value.variant == variant && value.size == size) {
      itemInCart = true;
      value.quantity += 1;
      newQuantity = value.quantity;
    }
  });
  if (!itemInCart) {
    items.push({
      'size' : size,
      'quantity': 1,
      'variant': variant
    });
  }
  this.setItem(id, items);
  this.updateCartDisplay(id);
  return $.extend({
      'size' : size,
      'quantity': 1,
      'variant': variant
      }, this.itemDict[id]);
};

/**
 * Removes an item from the cart db.
 * @param {string} id The id of the item to set.
 * @param {string} variant The color variant of the item.
 * @param {string} size The size of the item.
 * @return {Object} The item that was removed from the cart.
 */
ec.CartDB.prototype.removeCartItem = function(id, variant, size) {
  if (!this.itemDict[id]) { return;}
  variant = variant || this.defaultColor;
  size = size || this.defaultSize;
  var items = this.getItem(id);
  var newQuantity = 0;
  var foundIndex;
  $.each(items, function(index, value) {
    if (value.variant == variant && value.size == size) {
      value.quantity -= 1;
      newQuantity = value.quantity;
      foundIndex = index;
    }
  });
  if (newQuantity < 1 && foundIndex) {
    items.splice(foundIndex, 1);
  }
  this.setItem(id, items);
  // give the user a chance to pick which item
  this.updateCartDisplay(id);
  var removedObj = foundIndex != null ?
      $.extend({ 'size' : size, 'quantity': 1, 'variant': variant},
          this.itemDict[id]) : null;
  return removedObj;
};

/**
 * Clears the cart db. If opt_version is null, the current version is used.
 * @param {number=} opt_version The version of the db to clear.
 */
ec.CartDB.prototype.clearCart = function(opt_version) {
  var version = opt_version || this.version;
  var localStorageLength = localStorage.length;
  var storageIndex = 0;
  for (var i = 0; i < localStorageLength; i++) {
    var value = localStorage.key(storageIndex);
    if (this.isDBId(value)) {
      if (value.split('-')[0] == this.prefix + version) {
        localStorage.removeItem(value);
        storageIndex--;
        this.updateCartDisplay(value.split('-')[1]);
      }
    }
    storageIndex++;
  }
};

/**
 * Gets the items currently in cart for display.
 * @return {Array.<Object>} List of items currently in cart.
 */
ec.CartDB.prototype.getCartDisplayItems = function() {
  var items = [];
  var that = this;
  $.each(this.items, function(index, item) {
      var itemList = that.getItem(item.id);
      if (itemList.length != 0) {
        var total = 0;
        $.each(itemList, function() { total += this.quantity; });
        var obj = {'quantity': total};
        items.push($.extend(obj, item));
      }
  });
  return items;
};

/**
 * Gets the items currently in cart for checkout.
 * @return {Array.<Object>} List of items currently in cart.
 */
ec.CartDB.prototype.getCheckoutItems = function() {
  var items = [];
  var that = this;
  $.each(this.items, function(index, item) {
      var itemList = that.getItem(item.id);
      if (itemList.length != 0) {
        $.each(itemList, function(index, value) {
          var obj = {
            'quantity' : value.quantity,
            'variant' : value.variant,
            'size' : value.size
          };
          items.push($.extend(obj, item));
        });
      }
  });
  return items;
};

/**
 * Updates the shopping cart view.
 * @param {string} itemId The id for the item that changed.
 */
ec.CartDB.prototype.updateCartDisplay = function(itemId) {
  var quantity = 0;
  $.each(this.getItem(itemId), function() { quantity += this.quantity; });
  var price = parseInt(this.itemDict[itemId].price.replace('$', ''), 10);
  var name = this.itemDict[itemId].name;
  var cartRow = $('.cartItem-' + itemId);
  if (cartRow.length == 0 && quantity > 0) {
    $('#cartHeader').after(
        this.buildCartItem(itemId, name, price, quantity));
  } else if (quantity == 0) {
    $('#cart .cartItem-' + itemId).remove();
  } else {
    $('.cartQuantity-' + itemId).text(quantity);
    $('.cartPrice-' + itemId).text('$' + quantity * price);
  }
  this.updateCartTotal();
};

/**
 * Updates the shopping cart total.
 * @param {string=} opt_cartId The id for the cart to update.
 */
ec.CartDB.prototype.updateCartTotal = function(opt_cartId) {
  var cartId = opt_cartId || '#cart';
  var total = 0.0;
  var cartItems = $(cartId + ' .price');
  $.each(cartItems, function(index, item) {
      total = total + parseInt($.text(item).replace('$', ''));
  });
  $('.total').text('$' + total);
};

/**
 * Builds the html for a cart item row.
 * @param {string} id The id for the item.
 * @param {string} name The item's name.
 * @param {string} price The item's price.
 * @param {string} quantity The item's quantity.
 * @return {string} The html for the cart item row.
 */
ec.CartDB.prototype.buildCartItem = function(id, name, price, quantity) {
  return '<tr class="cartItem-' + id + '">' +
      '<td><a href="/item/' + id + '">' + name + '</a></td>' +
      '<td class="cartQuantity-' + id + '">' + quantity + '</td>' +
      '<td class="cartPrice-' + id + ' price">$' + quantity * price + '</td>' +
      '</tr>';
};

/**
 * Builds the html for a review cart item row.
 * @param {string} id The id for the item.
 * @param {string} name The item's name.
 * @param {string} price The item's price.
 * @param {string} quantity The item's quantity.
 * @param {string} trimColor The item's trimColor.
 * @param {string} size The item's size.
 * @param {boolean} withSelectBox Whether to render with a select box.
 * @return {string} The html for the cart item row.
 */
ec.CartDB.prototype.buildReviewCartItem = function(id, name, price,
    quantity, trimColor, size, withSelectBox) {
  var selectBox = '';
  if (withSelectBox) {
    selectBox = '<td><div class="checkbox"><input type="checkbox" value="' +
        id + '-' + trimColor + '-' + size + '"></div></td>';
  }
  return '<tr class="cartItem-' + id + '">' +
      '<td><a href="/item/' + id + '">' + name + '</a></td>' +
      '<td>' + quantity + '</td><td>' + trimColor + '</td><td>' + size +
      '</td>' + '<td class="cartPrice-' + id + ' price">$' +
      quantity * price + '</td>' + selectBox + '</tr>';
};


/**
 * Renders the cart view.
 */
ec.CartDB.prototype.render = function() {
  var cartItems = this.getCartDisplayItems();
  var that = this;
  $.each(cartItems, function() {
    that.updateCartDisplay(this.id);
  });
};

/**
 * Renders the review cart view.
 * @param {boolean=} opt_isSelectable whether to render with select boxes.
 * @return {string} the html for the review cart.
 */
ec.CartDB.prototype.renderReviewCart = function(opt_isSelectable) {
  var cartItems = this.getCheckoutItems();
  var html = '';
  var that = this;
  $.each(cartItems, function() {
    html += that.buildReviewCartItem(this.id, this.name,
        parseInt(this.price.replace('$', '')), this.quantity, this.variant,
        this.size, !!opt_isSelectable);
  });
  return html;
};

/**
 * Backs up the checkout cart, used for refund process.
 */
ec.CartDB.prototype.backupCart = function() {
  var cartItems = this.getCheckoutItems();
  this.backupCartInMemory = cartItems;
};

/**
 * Returns the backup cart.
 * @return {Object} backup cart.
 */
ec.CartDB.prototype.getBackupCart = function() {
  return this.backupCartInMemory || [];
};

/**
 * Clears the backup cart. If a list of ids are given, clears only those items.
 * @param {Arrray.<string>=} opt_idList a list of item ids
 */
ec.CartDB.prototype.clearBackupCart = function(opt_idList) {
  if (opt_idList && opt_idList.length > 0) {
    this.backupCartInMemory = this.backupCartInMemory.filter(function(item) {
      return $.grep(opt_idList, function(id) {
        var idParts = id.split('-');
        return idParts[0] == item.id && idParts[1] == item.variant &&
            idParts[2] == item.size;
      }).length < 1;
    });
  } else {
    this.backupCartInMemory = [];
  }
};

//javascript/closure/string/string.js
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 * @author pupius@google.com (Daniel Pupius)
 * @author arv@google.com (Erik Arvidsson)
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * @define {boolean} Enables HTML escaping of lowercase letter "e" which helps
 * with detection of double-escaping as this letter is frequently used.
 */
goog.define('goog.string.DETECT_DOUBLE_ESCAPING', false);


/**
 * @define {boolean} Whether to force non-dom html unescaping.
 */
goog.define('goog.string.FORCE_NON_DOM_HTML_UNESCAPING', false);


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Case-insensitive equality checker.
 * @param {string} str1 First string to check.
 * @param {string} str2 Second string to check.
 * @return {boolean} True if {@code str1} and {@code str2} are the same string,
 *     ignoring case.
 */
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  var splitParts = str.split('%s');
  var returnString = '';

  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length &&
         // Replace up to the last split part. We are inserting in the
         // positions between split parts.
         splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }

  return returnString + splitParts.join('%s'); // Join unused '%s'
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmptyOrWhitespace = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is empty.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty.
 */
goog.string.isEmptyString = function(str) {
  return str.length == 0;
};


/**
 * Checks if a string is empty or contains only whitespaces.
 *
 * TODO(kenobi): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespace.
 *
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = goog.string.isEmptyOrWhitespace;


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 * @deprecated Use goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str))
 *     instead.
 */
goog.string.isEmptyOrWhitespaceSafe = function(str) {
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str));
};


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 *
 * TODO(kenobi): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespaceSafe.
 *
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 */
goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = (goog.TRUSTED_SITE && String.prototype.trim) ?
    function(str) {
      return str.trim();
    } :
    function(str) {
      // Since IE doesn't include non-breaking-space (0xa0) in their \s
      // character class (as required by section 7.2 of the ECMAScript spec),
      // we explicitly include it in the regexp to enforce consistent
      // cross-browser behavior.
      return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    };


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Compares two strings interpreting their numeric substrings as numbers.
 *
 * @param {string} str1 First string.
 * @param {string} str2 Second string.
 * @param {!RegExp} tokenizerRegExp Splits a string into substrings of
 *     non-negative integers, non-numeric characters and optionally fractional
 *     numbers starting with a decimal point.
 * @return {number} Negative if str1 < str2, 0 is str1 == str2, positive if
 *     str1 > str2.
 * @private
 */
goog.string.numberAwareCompare_ = function(str1, str2, tokenizerRegExp) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(tokenizerRegExp);
  var tokens2 = str2.toLowerCase().match(tokenizerRegExp);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {
      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII string
  // comparison to stabilize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * String comparison function that handles non-negative integer numbers in a
 * way humans might expect. Using this function, the string 'File 2.jpg' sorts
 * before 'File 10.jpg', and 'Version 1.9' before 'Version 1.10'. The comparison
 * is mostly case-insensitive, though strings that are identical except for case
 * are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is up to 50x slower than either the default or the
 * case-insensitive compare. It should not be used in time-critical code, but
 * should be fast enough to sort several hundred short strings (like filenames)
 * with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.intAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\D+/g);
};


/**
 * String comparison function that handles non-negative integer and fractional
 * numbers in a way humans might expect. Using this function, the string
 * 'File 2.jpg' sorts before 'File 10.jpg', and '3.14' before '3.2'. Equivalent
 * to {@link goog.string.intAwareCompare} apart from the way how it interprets
 * dots.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.floatAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\.\d+|\D+/g);
};


/**
 * Alias for {@link goog.string.floatAwareCompare}.
 *
 * @param {string} str1
 * @param {string} str2
 * @return {number}
 */
goog.string.numerateCompare = goog.string.floatAwareCompare;


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escapes double quote '"' and single quote '\'' characters in addition to
 * '&', '<', and '>' so that a string can be included in an HTML tag attribute
 * value within double or single quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * With goog.string.DETECT_DOUBLE_ESCAPING, this function escapes also the
 * lowercase letter "e".
 *
 * NOTE(pupius):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    str = str.replace(goog.string.AMP_RE_, '&amp;')
          .replace(goog.string.LT_RE_, '&lt;')
          .replace(goog.string.GT_RE_, '&gt;')
          .replace(goog.string.QUOT_RE_, '&quot;')
          .replace(goog.string.SINGLE_QUOTE_RE_, '&#39;')
          .replace(goog.string.NULL_RE_, '&#0;');
    if (goog.string.DETECT_DOUBLE_ESCAPING) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.ALL_RE_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.AMP_RE_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.LT_RE_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.GT_RE_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.QUOT_RE_, '&quot;');
    }
    if (str.indexOf('\'') != -1) {
      str = str.replace(goog.string.SINGLE_QUOTE_RE_, '&#39;');
    }
    if (str.indexOf('\x00') != -1) {
      str = str.replace(goog.string.NULL_RE_, '&#0;');
    }
    if (goog.string.DETECT_DOUBLE_ESCAPING && str.indexOf('e') != -1) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.AMP_RE_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.LT_RE_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.GT_RE_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.QUOT_RE_ = /"/g;


/**
 * Regular expression that matches a single quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.SINGLE_QUOTE_RE_ = /'/g;


/**
 * Regular expression that matches null character, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.NULL_RE_ = /\x00/g;


/**
 * Regular expression that matches a lowercase letter "e", for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.E_RE_ = /e/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @const {!RegExp}
 * @private
 */
goog.string.ALL_RE_ = (goog.string.DETECT_DOUBLE_ESCAPING ?
    /[\x00&<>"'e]/ :
    /[\x00&<>"']/);


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one or we explicitly
    // requested non-DOM html unescaping.
    if (!goog.string.FORCE_NON_DOM_HTML_UNESCAPING &&
        'document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes a HTML string using the provided document.
 *
 * @param {string} str The string to unescape.
 * @param {!Document} document A document to use in escaping the string.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, '&')) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @param {Document=} opt_document An optional document to use for creating
 *     elements. If this is not specified then the default window.document
 *     will be used.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  /** @type {!Object<string, string>} */
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement('div');
  } else {
    div = goog.global.document.createElement('div');
  }
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  // This doesn't use goog.string.preserveSpaces for backwards compatibility.
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Preserve spaces that would be otherwise collapsed in HTML by replacing them
 * with non-breaking space Unicode characters.
 * @param {string} str The string in which to preserve whitespace.
 * @return {string} A copy of {@code str} with preserved whitespace.
 */
goog.string.preserveSpaces = function(str) {
  return str.replace(/(^|[\n ]) /g, '$1' + goog.string.Unicode.NBSP);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private {!Object<string, string>}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\',
  // To support the use case of embedding quoted strings inside of script
  // tags, we have to make sure HTML comments and opening/closing script tags do
  // not appear in the resulting string. The specific strings that must be
  // escaped are documented at:
  // http://www.w3.org/TR/html51/semantics.html#restrictions-for-contents-of-script-elements
  '<': '\x3c'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private {!Object<string, string>}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string. The resulting string is safe to embed in
 * `<script>` tags as "<" is escaped.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  var sb = ['"'];
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    var cc = ch.charCodeAt(0);
    sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
                ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
  }
  sb.push('"');
  return sb.join('');
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Determines whether a string contains a substring.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.contains = function(str, subString) {
  return str.indexOf(subString) != -1;
};


/**
 * Determines whether a string contains a substring, ignoring case.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.caseInsensitiveContains = function(str, subString) {
  return goog.string.contains(str.toLowerCase(), subString.toLowerCase());
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = (String.prototype.repeat) ?
    function(string, length) {
      // The native method is over 100 times faster than the alternative.
      return string.repeat(length);
    } :
    function(string, length) {
      return new Array(length + 1).join(string);
    };


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    // Normalize to 4 byte range, 0 ... 2^32.
    result = (31 * result + str.charCodeAt(i)) >>> 0;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Infinity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmptyOrWhitespace(str)) {
    return NaN;
  }
  return num;
};


/**
 * Returns whether the given string is lower camel case (e.g. "isFooBar").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is lower camel case.
 */
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};


/**
 * Returns whether the given string is upper camel case (e.g. "FooBarBaz").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is upper camel case.
 */
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};


/**
 * Converts a string into TitleCase. First character of the string is always
 * capitalized in addition to the first letter of every subsequent word.
 * Words are delimited by one or more whitespaces by default. Custom delimiters
 * can optionally be specified to replace the default, which doesn't preserve
 * whitespace delimiters and instead must be explicitly included if needed.
 *
 * Default delimiter => " ":
 *    goog.string.toTitleCase('oneTwoThree')    => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three')  => 'One Two Three'
 *    goog.string.toTitleCase('  one   two   ') => '  One   Two   '
 *    goog.string.toTitleCase('one_two_three')  => 'One_two_three'
 *    goog.string.toTitleCase('one-two-three')  => 'One-two-three'
 *
 * Custom delimiter => "_-.":
 *    goog.string.toTitleCase('oneTwoThree', '_-.')       => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three', '_-.')     => 'One two three'
 *    goog.string.toTitleCase('  one   two   ', '_-.')    => '  one   two   '
 *    goog.string.toTitleCase('one_two_three', '_-.')     => 'One_Two_Three'
 *    goog.string.toTitleCase('one-two-three', '_-.')     => 'One-Two-Three'
 *    goog.string.toTitleCase('one...two...three', '_-.') => 'One...Two...Three'
 *    goog.string.toTitleCase('one. two. three', '_-.')   => 'One. two. three'
 *    goog.string.toTitleCase('one-two.three', '_-.')     => 'One-Two.Three'
 *
 * @param {string} str String value in camelCase form.
 * @param {string=} opt_delimiters Custom delimiter character set used to
 *      distinguish words in the string value. Each character represents a
 *      single delimiter. When provided, default whitespace delimiter is
 *      overridden and must be explicitly included if needed.
 * @return {string} String value in TitleCase form.
 */
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) : '\\s';

  // For IE8, we need to prevent using an empty character set. Otherwise,
  // incorrect matching will occur.
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';

  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};


/**
 * Capitalizes a string, i.e. converts the first letter to uppercase
 * and all other letters to lowercase, e.g.:
 *
 * goog.string.capitalize('one')     => 'One'
 * goog.string.capitalize('ONE')     => 'One'
 * goog.string.capitalize('one two') => 'One two'
 *
 * Note that this function does not trim initial whitespace.
 *
 * @param {string} str String value to capitalize.
 * @return {string} String value with first letter in uppercase.
 */
goog.string.capitalize = function(str) {
  return String(str.charAt(0)).toUpperCase() +
      String(str.substr(1)).toLowerCase();
};


/**
 * Parse a string in decimal or hexidecimal ('0xFFFF') form.
 *
 * To parse a particular radix, please use parseInt(string, radix) directly. See
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/parseInt
 *
 * This is a wrapper for the built-in parseInt function that will only parse
 * numbers as base 10 or base 16.  Some JS implementations assume strings
 * starting with "0" are intended to be octal. ES3 allowed but discouraged
 * this behavior. ES5 forbids it.  This function emulates the ES5 behavior.
 *
 * For more information, see Mozilla JS Reference: http://goo.gl/8RiFj
 *
 * @param {string|number|null|undefined} value The value to be parsed.
 * @return {number} The number, parsed. If the string failed to parse, this
 *     will be NaN.
 */
goog.string.parseInt = function(value) {
  // Force finite numbers to strings.
  if (isFinite(value)) {
    value = String(value);
  }

  if (goog.isString(value)) {
    // If the string starts with '0x' or '-0x', parse as hex.
    return /^\s*-?0x/i.test(value) ?
        parseInt(value, 16) : parseInt(value, 10);
  }

  return NaN;
};


/**
 * Splits a string on a separator a limited number of times.
 *
 * This implementation is more similar to Python or Java, where the limit
 * parameter specifies the maximum number of splits rather than truncating
 * the number of results.
 *
 * See http://docs.python.org/2/library/stdtypes.html#str.split
 * See JavaDoc: http://goo.gl/F2AsY
 * See Mozilla reference: http://goo.gl/dZdZs
 *
 * @param {string} str String to split.
 * @param {string} separator The separator.
 * @param {number} limit The limit to the number of splits. The resulting array
 *     will have a maximum length of limit+1.  Negative numbers are the same
 *     as zero.
 * @return {!Array<string>} The string, split.
 */

goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];

  // Only continue doing this while we haven't hit the limit and we have
  // parts left.
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }

  // If there are remaining parts, append them to the end.
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }

  return returnVal;
};


/**
 * Computes the Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @return {number} The edit distance between the two strings.
 */
goog.string.editDistance = function(a, b) {
  var v0 = [];
  var v1 = [];

  if (a == b) {
    return 0;
  }

  if (!a.length || !b.length) {
    return Math.max(a.length, b.length);
  }

  for (var i = 0; i < b.length + 1; i++) {
    v0[i] = i;
  }

  for (var i = 0; i < a.length; i++) {
    v1[0] = i + 1;

    for (var j = 0; j < b.length; j++) {
      var cost = a[i] != b[j];
      // Cost for the substring is the minimum of adding one character, removing
      // one character, or a swap.
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }

    for (var j = 0; j < v0.length; j++) {
      v0[j] = v1[j];
    }
  }

  return v1[b.length];
};

//javascript/closure/string/stringformat.js
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implementation of sprintf-like, python-%-operator-like,
 * .NET-String.Format-like functionality. Uses JS string's replace method to
 * extract format specifiers and sends those specifiers to a handler function,
 * which then, based on conversion type part of the specifier, calls the
 * appropriate function to handle the specific conversion.
 * For specific functionality implemented, look at formatRe below, or look
 * at the tests.
 * @author rosic@google.com (Srdjan Rosic)
 */

goog.provide('goog.string.format');

goog.require('goog.string');


/**
 * Performs sprintf-like conversion, i.e. puts the values in a template.
 * DO NOT use it instead of built-in conversions in simple cases such as
 * 'Cost: %.2f' as it would introduce unnecessary latency opposed to
 * 'Cost: ' + cost.toFixed(2).
 * @param {string} formatString Template string containing % specifiers.
 * @param {...string|number} var_args Values formatString is to be filled with.
 * @return {string} Formatted string.
 */
goog.string.format = function(formatString, var_args) {

  // Convert the arguments to an array (MDC recommended way).
  var args = Array.prototype.slice.call(arguments);

  // Try to get the template.
  var template = args.shift();
  if (typeof template == 'undefined') {
    throw Error('[goog.string.format] Template required');
  }

  // This re is used for matching, it also defines what is supported.
  var formatRe = /%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g;

  /**
   * Chooses which conversion function to call based on type conversion
   * specifier.
   * @param {string} match Contains the re matched string.
   * @param {string} flags Formatting flags.
   * @param {string} width Replacement string minimum width.
   * @param {string} dotp Matched precision including a dot.
   * @param {string} precision Specifies floating point precision.
   * @param {string} type Type conversion specifier.
   * @param {string} offset Matching location in the original string.
   * @param {string} wholeString Has the actualString being searched.
   * @return {string} Formatted parameter.
   */
  function replacerDemuxer(match,
                           flags,
                           width,
                           dotp,
                           precision,
                           type,
                           offset,
                           wholeString) {

    // The % is too simple and doesn't take an argument.
    if (type == '%') {
      return '%';
    }

    // Try to get the actual value from parent function.
    var value = args.shift();

    // If we didn't get any arguments, fail.
    if (typeof value == 'undefined') {
      throw Error('[goog.string.format] Not enough arguments');
    }

    // Patch the value argument to the beginning of our type specific call.
    arguments[0] = value;

    return goog.string.format.demuxes_[type].apply(null, arguments);

  }

  return template.replace(formatRe, replacerDemuxer);
};


/**
 * Contains various conversion functions (to be filled in later on).
 * @private {!Object}
 */
goog.string.format.demuxes_ = {};


/**
 * Processes %s conversion specifier.
 * @param {string} value Contains the formatRe matched string.
 * @param {string} flags Formatting flags.
 * @param {string} width Replacement string minimum width.
 * @param {string} dotp Matched precision including a dot.
 * @param {string} precision Specifies floating point precision.
 * @param {string} type Type conversion specifier.
 * @param {string} offset Matching location in the original string.
 * @param {string} wholeString Has the actualString being searched.
 * @return {string} Replacement string.
 */
goog.string.format.demuxes_['s'] = function(value,
                                            flags,
                                            width,
                                            dotp,
                                            precision,
                                            type,
                                            offset,
                                            wholeString) {
  var replacement = value;
  // If no padding is necessary we're done.
  // The check for '' is necessary because Firefox incorrectly provides the
  // empty string instead of undefined for non-participating capture groups,
  // and isNaN('') == false.
  if (isNaN(width) || width == '' || replacement.length >= width) {
    return replacement;
  }

  // Otherwise we should find out where to put spaces.
  if (flags.indexOf('-', 0) > -1) {
    replacement =
        replacement + goog.string.repeat(' ', width - replacement.length);
  } else {
    replacement =
        goog.string.repeat(' ', width - replacement.length) + replacement;
  }
  return replacement;
};


/**
 * Processes %f conversion specifier.
 * @param {string} value Contains the formatRe matched string.
 * @param {string} flags Formatting flags.
 * @param {string} width Replacement string minimum width.
 * @param {string} dotp Matched precision including a dot.
 * @param {string} precision Specifies floating point precision.
 * @param {string} type Type conversion specifier.
 * @param {string} offset Matching location in the original string.
 * @param {string} wholeString Has the actualString being searched.
 * @return {string} Replacement string.
 */
goog.string.format.demuxes_['f'] = function(value,
                                            flags,
                                            width,
                                            dotp,
                                            precision,
                                            type,
                                            offset,
                                            wholeString) {

  var replacement = value.toString();

  // The check for '' is necessary because Firefox incorrectly provides the
  // empty string instead of undefined for non-participating capture groups,
  // and isNaN('') == false.
  if (!(isNaN(precision) || precision == '')) {
    replacement = parseFloat(value).toFixed(precision);
  }

  // Generates sign string that will be attached to the replacement.
  var sign;
  if (value < 0) {
    sign = '-';
  } else if (flags.indexOf('+') >= 0) {
    sign = '+';
  } else if (flags.indexOf(' ') >= 0) {
    sign = ' ';
  } else {
    sign = '';
  }

  if (value >= 0) {
    replacement = sign + replacement;
  }

  // If no padding is neccessary we're done.
  if (isNaN(width) || replacement.length >= width) {
    return replacement;
  }

  // We need a clean signless replacement to start with
  replacement = isNaN(precision) ?
      Math.abs(value).toString() :
      Math.abs(value).toFixed(precision);

  var padCount = width - replacement.length - sign.length;

  // Find out which side to pad, and if it's left side, then which character to
  // pad, and set the sign on the left and padding in the middle.
  if (flags.indexOf('-', 0) >= 0) {
    replacement = sign + replacement + goog.string.repeat(' ', padCount);
  } else {
    // Decides which character to pad.
    var paddingChar = (flags.indexOf('0', 0) >= 0) ? '0' : ' ';
    replacement =
        sign + goog.string.repeat(paddingChar, padCount) + replacement;
  }

  return replacement;
};


/**
 * Processes %d conversion specifier.
 * @param {string} value Contains the formatRe matched string.
 * @param {string} flags Formatting flags.
 * @param {string} width Replacement string minimum width.
 * @param {string} dotp Matched precision including a dot.
 * @param {string} precision Specifies floating point precision.
 * @param {string} type Type conversion specifier.
 * @param {string} offset Matching location in the original string.
 * @param {string} wholeString Has the actualString being searched.
 * @return {string} Replacement string.
 */
goog.string.format.demuxes_['d'] = function(value,
                                            flags,
                                            width,
                                            dotp,
                                            precision,
                                            type,
                                            offset,
                                            wholeString) {
  return goog.string.format.demuxes_['f'](
      parseInt(value, 10) /* value */,
      flags, width, dotp, 0 /* precision */,
      type, offset, wholeString);
};


// These are additional aliases, for integer conversion.
goog.string.format.demuxes_['i'] = goog.string.format.demuxes_['d'];
goog.string.format.demuxes_['u'] = goog.string.format.demuxes_['d'];

//analytics/devrel/demos/enhancedecommerce/javascript/ga-methods.js
/**
 * @fileoverview ec.GA, the functions used to send GA hits and to display the
 * GTM and EC.js code.
 */
goog.provide('ec.GA');
goog.provide('ec.GA.string');

goog.require('goog.string.format');

/**
 * Creates the promotion object.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 * @return {Object} the promotion object
 */
ec.GA.createPromotionObject = function(creative, placement) {
  return [{
    'id': 'bts',
    'name': 'Back To School',
    'creative': creative + ' ' + placement,
    'position': 'right sidebar'
   }];
};

/**
 * Creates product objects.
 * @param {Array.<Object>} items the items to modify.
 * @param {string=} opt_list the list the items were viewed in.
 * @return {Object} the product objects
 */
ec.GA.createProductObjects = function(items, opt_list) {
  var productObjects = [];
  var listSize = items.length;
  $.each(items, function(index, value) {
    var obj = {
      'id': value.id,
      'name': value.name,
      'price': value.price.slice(1),
      'brand': value.name.split(' ')[0],
      'category': 'T-Shirts',
      'variant': value.variant,
      'dimension1': value.size
    };
    obj['position'] = listSize > 1 ? index : value.position || 0;
    if (opt_list) {
      obj['list'] = opt_list;
    }
    if (value.quantity) {
      obj['quantity'] = value.quantity;
    }
    productObjects.push(obj);
  });
  return productObjects;
};

/**
 * Sends a GA hit with impressions for the item sets and a promotion view.
 * @param {Array.<Object>} items the main impression items.
 * @param {Array.<Object>} promoItems the shirts you may like impression items.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 */
ec.GA.sendImpressions = function(items, promoItems, creative, placement) {
 dataLayer.push({
    'ecommerce': {
      'currencyCode': 'USD',
      'impressions': $.merge(ec.GA.createProductObjects(items, 'homepage'),
          ec.GA.createProductObjects(promoItems, 'shirts you may like')),
      'promoView': {
        'promotions' : ec.GA.createPromotionObject(creative, placement)
      }
    }
  });
};

/**
 * Sends a GA promotion click.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 */
ec.GA.sendPromotionClick = function(creative, placement,next) {
  dataLayer.push({
    'event': 'promotionClick',
    'ecommerce': {
      'promoClick': {
        'promotions' : ec.GA.createPromotionObject(creative, placement)
      }
    },
      'eventCallback': function() {
       document.location = './item/'+next+'.html'
     },
     'item':next
  });
};

/**
 * Sends a GA product click.
 * @param {Array.<Object>} items the items that were clicked.
 * @param {string=} opt_list the list the items were viewed in.
 */
ec.GA.sendProductClick = function(items, opt_list,next) {
  dataLayer.push({
    'event': 'productClick',
    'ecommerce': {
      'click': {
        'actionField': {'list': opt_list || 'none'},
        'products': ec.GA.createProductObjects(items)
      }
    },
     'eventCallback': function() {
       document.location = './item/'+next+'.html'
     },
    'item':next,
  });
};

/**
 * Sends a GA product view with impressions for the item set
 * and a promotion view.
 * @param {Array.<Object>} items the product being viewed.
 * @param {Array.<Object>} promoItems the shirts you may like impression items.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 */
ec.GA.sendProductView = function(items, promoItems, creative, placement) {
  dataLayer.push({
    'ecommerce': {
      'impressions':
          ec.GA.createProductObjects(promoItems),
      'detail': {
        'products': ec.GA.createProductObjects(items)
       },
      'promoView': {
        'promotions' : ec.GA.createPromotionObject(creative, placement)
      }
     }
   });
};

/**
 * Sends a GA add to cart event.
 * @param {Array.<Object>} items the items added to cart.
 */
ec.GA.sendAddToCart = function(items) {
  dataLayer.push({
    'event': 'addToCart',
    'ecommerce': {
      'currencyCode': 'USD',
      'add': {
        'products': ec.GA.createProductObjects(items)
       }
     }
  });
};

/**
 * Sends a GA remove from cart event.
 * @param {Array.<Object>} items the items removed from the cart.
 */
ec.GA.sendRemoveFromCart = function(items) {
 dataLayer.push({
   'event': 'removeFromCart',
   'ecommerce': {
      'remove': {
        'products': ec.GA.createProductObjects(items)
       }
     }
  });
};

/**
 * Sends a GA checkout step event with a promotion view.
 * @param {number} step the checkout step number
 * @param {Array.<Object>} items the items in the cart.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 */
ec.GA.sendCheckoutStep = function(step, items, creative, placement) {
  var actionField = {'step': step};
  dataLayer.push({
    'event': 'checkout',
    'ecommerce': {
       'checkout': {
         'actionField': actionField,
         'products': ec.GA.createProductObjects(items)
       },
      'promoView': {
         'promotions' : ec.GA.createPromotionObject(creative, placement)
       }
     }
  });
};

/**
 * Sends a GA checkout option.
 * @param {number} step the checkout step number.
 * @param {string} option the checkout option to send.
 */
ec.GA.sendCheckoutOption = function(step, option) {
  dataLayer.push({
    'event': 'checkoutOption',
    'ecommerce': {
       'checkout_option': {
         'actionField': {'step': step, 'option': option}
       }
     }
   });
};

/**
 * Sends a GA transaction event.
 * @param {Array.<Object>} items the items being purchased.
 * @param {string} transactionId the transaction id.
 */
ec.GA.sendTransaction = function(items, transactionId) {
  var total = 10;
  $.each(items, function(index, item) {
    total = total + parseInt(item.price.replace('$', '')) * item.quantity;
  });
  dataLayer.push({
    'event': 'transaction',
    'ecommerce': {
      'purchase': {
        'actionField': {
          'id': transactionId, // Required for purchases and refunds.
          'affiliation': 'Online Store',
          'revenue': total, // Total transaction value (incl. tax and shipping)
          'tax': '5.00',
          'shipping': '5.00'
        },
        'products': ec.GA.createProductObjects(items)
      }
    }
  });
};

/**
 * Sends a GA full refund event.
 * @param {string} transactionId the transaction id.
 */
ec.GA.sendRefund = function(transactionId) {
  dataLayer.push({
    'event': 'refund',
    'ecommerce': {
      'refund' : {
        'actionField': {'id': transactionId}
      }
    }
  });
};

/**
 * Sends a GA partial refund event.
 * @param {string} transactionId the transaction id.
 * @param {Array.<Object>} cartItems the items in the backup cart.
 * @param {Array.<string>} idList list of item ids to be refunded.
 */
ec.GA.sendRefundByItem = function(transactionId, cartItems, idList) {
  var products = [];
  $.each(cartItems, function() {
    var that = this;
    var ids = $.grep(idList, function(bigId) {
      var idParts = bigId.split('-');
      return idParts[0] == that.id && idParts[1] == that.variant &&
          idParts[2] == that.size;
      });
    if (ids.length > 0) {
      products.push({'id': this.id, 'quantity': this.quantity});
    }
  });
  dataLayer.push({
    'event': 'refund',
    'ecommerce': {
      'refund' : {
        'actionField': {'id': transactionId},
        'products': products
      }
    }
  });
};

/**
 * Returns the display string for ec.GA.sendImpressions
 * @param {Array.<Object>} items the main impression items.
 * @param {Array.<Object>} promoItems the shirts you may like impression items.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getImpressions = function(items, promoItems, creative, placement) {
  var impressionItems = $.merge(ec.GA.createProductObjects(items, 'homepage'),
      ec.GA.createProductObjects(promoItems, 'shirts you may like'));
  var promotionObject = ec.GA.createPromotionObject(creative, placement);
  var gtmString = ec.GA.formatCodeString(goog.string.format(
      'dataLayer.push({"ecommerce":{"currencyCode":"USD","impressions":%s,' +
      '"promoView":{"promotions":%s}}});',
      JSON.stringify(impressionItems),
      JSON.stringify(promotionObject)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
      ec.GA.createECAddString('addImpression', impressionItems) +
      ec.GA.createECAddString('addPromo', promotionObject) +
      ec.GA.EC_PAGEVIEW_STRING);
  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendPromotionClick
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getPromotionClick = function(creative, placement) {
  var promotionObject = ec.GA.createPromotionObject(creative, placement);
  var gtmString = ec.GA.formatCodeString(goog.string.format(
      'dataLayer.push({"event":"promotionClick","ecommerce":{"promoClick":{' +
      '"promotions":%s}}});',
      JSON.stringify(promotionObject)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
      ec.GA.createECAddString('addPromo', promotionObject) +
      ec.GA.createECSetActionString('promo_click') +
      ec.GA.createECSendClickString(creative, placement));
  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendProductClick.
 * @param {Array.<Object>} items the items that were clicked.
 * @param {string} list the list the items were viewed in.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getProductClick = function(items, list) {
  var productObjects = ec.GA.createProductObjects(items);
  var gtmString = ec.GA.formatCodeString(goog.string.format(
      'dataLayer.push({"event":"productClick","ecommerce":{"click":{' +
      '"actionField":{"list":%s},"products":%s}}});',
      JSON.stringify(list),
      JSON.stringify(productObjects)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
      ec.GA.createECAddString('addProduct', productObjects) +
      ec.GA.createECSetActionString('click', {'list': list}) +
      ec.GA.createECSendClickString(list, ''));
  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendProductView.
 * @param {Array.<Object>} items the product being viewed.
 * @param {Array.<Object>} promoItems the shirts you may like impression items.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getProductView = function(items, promoItems, creative, placement) {
  var impressionObjects = ec.GA.createProductObjects(promoItems);
  var productObject = ec.GA.createProductObjects(items);
  var promotionObject = ec.GA.createPromotionObject(creative, placement);
  var gtmString = ec.GA.formatCodeString(goog.string.format(
      'dataLayer.push({"ecommerce":{"impressions":%s,"detail":{"products":%s}' +
      ',"promoView":{"promotions":%s}}});',
      JSON.stringify(impressionObjects),
      JSON.stringify(productObject),
      JSON.stringify(promotionObject)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
      ec.GA.createECAddString('addImpresson', impressionObjects) +
      ec.GA.createECAddString('addProduct', productObject) +
      ec.GA.createECAddString('addPromo', promotionObject) +
      ec.GA.createECSetActionString('detail') + ec.GA.EC_PAGEVIEW_STRING);
  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendAddToCart or
 * ec.GA.sendRemoveFromCart.
 * @param {Array.<Object>} items the items added to cart.
 * @param {string} action the action
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getCartAction = function(items, action) {
  var productObjects = ec.GA.createProductObjects(items);
  var fullAction = '';
  switch (action) {
    case 'add':
      fullAction = 'addToCart';
      break;
    case 'remove':
      fullAction = 'removeFromCart';
      break;
  }
  var gtmString = ec.GA.formatCodeString(goog.string.format(
      'dataLayer.push({"event":%s,"ecommerce":{"currencyCode":"USD",' +
      '%s:{"products":%s}}});',
      JSON.stringify(fullAction),
      JSON.stringify(action),
      JSON.stringify(productObjects)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
     ec.GA.createECAddString('addProduct', productObjects) +
     ec.GA.createECSetActionString(action) +
     ec.GA.createECSendClickString('detail view', fullAction));
  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendCheckoutStep
 * @param {number} step the checkout step number
 * @param {Array.<Object>} items the items in the cart.
 * @param {string} creative the title for the creative.
 * @param {string} placement the page the promotion is on.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getCheckoutStep = function(step, items, creative, placement) {
  var productObjects = ec.GA.createProductObjects(items);
  var promotionObject = ec.GA.createPromotionObject(creative, placement);
  var gtmString = ec.GA.formatCodeString(goog.string.format(
      'dataLayer.push({"event":"checkout","ecommerce":{"checkout":{' +
      '"actionField":{"step":%s},"products":%s},"promoView":{' +
      '"promotions":%s}}});',
      JSON.stringify(step),
      JSON.stringify(productObjects),
      JSON.stringify(promotionObject)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
      ec.GA.createECAddString('addProduct', productObjects) +
      ec.GA.createECAddString('addPromo', promotionObject) +
      ec.GA.createECSetActionString('checkout', {'step': step}) +
      ec.GA.EC_PAGEVIEW_STRING);
  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendCheckoutOption
 * @param {number} step the checkout step number.
 * @param {string} option the checkout option to send.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getCheckoutOption = function(step, option) {
  var stepObj = {'step': step, 'option': option};
  var gtmString = ec.GA.formatCodeString(goog.string.format(
      'dataLayer.push({"event":"checkoutOption","ecommerce":{' +
      '"checkout_option":{"actionField":{"step":%s,"option":%s}}}});',
      JSON.stringify(step), JSON.stringify(option)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
      ec.GA.createECSetActionString('checkout_option', stepObj) +
      "ga('send','event','Checkout','Option');");
  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendTransaction
 * @param {Array.<Object>} items the items being purchased.
 * @param {string} transactionId the transaction id.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getTransaction = function(items, transactionId) {
  var total = 10;
  $.each(items, function(index, item) {
    total = total + parseInt(item.price.replace('$', '')) * item.quantity;
  });
  var productObjects = ec.GA.createProductObjects(items);
  var purchaseObj = {
    'id': transactionId,
    'affiliation': 'Online Store',
    'revenue': total,
    'tax' : 5.00,
    'shipping': 5.00
  };
  var gtmString = ec.GA.formatCodeString(goog.string.format(
    'dataLayer.push({"event":"transaction","ecommerce":{' +
    '"purchase":{"actionField":%s,"products":%s}}});',
    JSON.stringify(purchaseObj),
    JSON.stringify(productObjects)));
  var ecJsString = ec.GA.formatCodeString(ec.GA.EC_LOAD_STRING +
      ec.GA.createECAddString('addProduct', productObjects) +
      ec.GA.createECSetActionString('purchase', purchaseObj) +
      ec.GA.EC_PAGEVIEW_STRING);

  return [gtmString, ecJsString];
};

/**
 * Returns the display string for ec.GA.sendRefund or ec.GA.sendRefundByItem
 * @param {string} transactionId the transaction id.
 * @param {Array.<Object>=} opt_cartItems the items in the backup cart.
 * @param {Array.<string>=} opt_idList list of item ids to be refunded.
 * @return {Array.<string>} the display strings for gtm and ec.js
 */
ec.GA.string.getRefund = function(transactionId, opt_cartItems, opt_idList) {
  var productGTMString = '';
  var productECString = '';
  if (opt_cartItems && opt_idList) {
    var products = [];
    $.each(opt_cartItems, function() {
      var that = this;
      var ids = $.grep(opt_idList, function(bigId) {
        var idParts = bigId.split('-');
        return idParts[0] == that.id && idParts[1] == that.variant &&
            idParts[2] == that.size;
      });
      if (ids.length > 0) {
        products.push({'id': this.id, 'quantity': this.quantity});
      }
    });
    productGTMString = goog.string.format(',"products":%s',
        JSON.stringify(products));
    productECString = ec.GA.createECAddString('addProduct', products);
  }
  var gtmString = ec.GA.formatCodeString(goog.string.format(
    'dataLayer.push({"event":"refund","ecommerce":{' +
    '"refund":{"actionField":{"id":%s}%s}}});',
    JSON.stringify(transactionId), productGTMString));
  var ecJsString = ec.GA.formatCodeString(
      ec.GA.EC_LOAD_STRING + productECString +
      ec.GA.createECSetActionString('refund', {'id': transactionId}) +
      ec.GA.EC_PAGEVIEW_STRING);
  return [gtmString, ecJsString];
};

/**
 * Formats a string of code so it is easily readable.
 * @param {string} str the string to format.
 * @return {string} the formatted string
 */
ec.GA.formatCodeString = function(str) {
  var indent = 0;
  var newStr = '';
  var inBigQuotes = false;
  var inSmallQuotes = false;
  $.each(str.split(''), function(index, value) {
    if (value == '"') {
      inBigQuotes = !inBigQuotes;
    } else if (value == "'") {
      inSmallQuotes = !inSmallQuotes;
    }
    if (inBigQuotes || inSmallQuotes) {
      newStr += value;
    } else {
      if (value == '}') {
         indent -= 2;
         newStr += '\n' + new Array(indent + 1).join(' ');
      }
      newStr += value;
      switch (value) {
        case ':':
          newStr += ' ';
          break;
        case '{':
          indent += 2;
          //fallthrough
        case ',':
         if (indent == 0) {
           newStr += ' ';
           break;
         } //else fallthrough
        case ';':
          newStr += '\n' + new Array(indent + 1).join(' ');
          break;
      }
    }
  });
  return newStr;
};

/**
 * The ec.js load string.
 * @type {string}
 * @const
 */
//ec.GA.EC_LOAD_STRING = 'ga("create","UA-XXXXX-Y");ga("require","ec");';

/**
 * The ec.js pageview string.
 * @type {string}
 * @const
 */
ec.GA.EC_PAGEVIEW_STRING = 'ga("send","pageview")';

/**
 * Creates a ec.js send click string
 * @param {string} source the source of the click
 * @param {string} type the type of page being viewed
 * @return {string} the send click string.
 */
ec.GA.createECSendClickString = function(source, type) {
  return 'ga("send","event","' + source + '","click","' + type + '");';
};

/**
 * Creates a ec.js add string.
 * @param {string} toAdd the type being added
 * @param {Array.<Object>} items the items to add
 * @return {string} the add string.
 */
ec.GA.createECAddString = function(toAdd, items) {
  var str = '';
  $.each(items, function(index, value) {
    str += 'ga("ec:' + toAdd + '",' + JSON.stringify(value) + ');';
  });
  return str;
};

/**
 * Creates a ec.js set action string
 * @param {string} action the action
 * @param {Object=} opt_details extra details belonging to the action.
 * @return {string} the set action string.
 */
ec.GA.createECSetActionString = function(action, opt_details) {
  var str = 'ga("ec:setAction","' + action + '"';
  if (opt_details) {
    str += ',' + JSON.stringify(opt_details);
  }
  return str + ');';
};

//analytics/devrel/demos/enhancedecommerce/javascript/page.js
/**
 * @fileoverview Common code for all HTML pages.
 */

goog.provide('ec.Page');

goog.require('ec.CartDB');
goog.require('ec.GA');
goog.require('ec.GA.string');

/**
 * @param {string} type The page type.
 * @param {Object=} opt_vars Set of initializing variables from server.
 * @constructor
 * @export
 */
ec.Page = function(type, opt_vars) {
  // Initialize variables
  opt_vars = opt_vars || {};
  this.type = type;
  this.itemsList = opt_vars['itemsList'] || [];
  this.promoList = opt_vars['promoList'] || [];
  this.productId = opt_vars['productId'] || '';
  this.transactionId = opt_vars['transactionId'] || '';
  this.codeStrings = ['no code', 'no code'];

  this.itemDict = {};
  $.each(this.itemsList, goog.bind(function(index, value) {
    this.itemDict[value.id] = value;
  }, this));

  this.cart = new ec.CartDB(this.itemsList);
  dataLayer = [];

  this.onLoad();
};

/**
 * List of checkout tab ids.
 * @type {Array.<string>}
 * @const
 */
ec.Page.CHECKOUT_TAB_IDS = ['start', 'customerInfo', 'billingInfo',
    'reviewCart', 'confirmation'];

/**
 * List of checkout tab titles.
 * @type {Array.<string>}
 * @const
 */
ec.Page.CHECKOUT_TAB_TITLES = ['Start', 'Customer Information',
    'Billing Information', 'Review Cart', 'Confirmation'];

/**
 * Sends the GA pageview hit and binds onReady to document ready.
 */
ec.Page.prototype.onLoad = function() {
  switch (this.type) {
    case 'HOME':
      ec.GA.sendImpressions(this.itemsList, this.promoList, this.type,
          'banner');
      break;
    case 'PRODUCT':
      var items = [this.itemDict[this.productId]];
      ec.GA.sendProductView(items, this.promoList, this.type, 'right');
      break;
    case 'CHECKOUT':
      var hashStep = window.location.hash.slice(1);
      // navigation directly to confirmation tab is not allowed.
      if (hashStep == 'confirmation') { hashStep = 'start';}
      this.step = this.getStepNumber(hashStep) ? hashStep : 'start';
      ec.GA.sendCheckoutStep(this.getStepNumber(this.step),
          this.cart.getCheckoutItems(), this.type, 'right');
      break;
  }
  $(document).ready(goog.bind(this.onReady, this));
};

/**
 * Renders the cart and attaches button handlers for the page.
 */
ec.Page.prototype.onReady = function() {
  this.cart.render();
  window.prettyPrint();
  var bannerId = '#GA-banner';
  switch (this.type) {
    case 'CHECKOUT':
      $('#refundCartHeader').after(this.cart.renderReviewCart(true));
      $('#reviewCartHeader').after(this.cart.renderReviewCart());
      $('#checkoutTabs a[href="#' + this.step + '"]').tab('show');
    //fallthrough
    case 'PRODUCT':
      $(bannerId).remove();
      break;
  }
  this.attachButtonHandlers();
};

/**
 * Switches the checkout tab and sends GA hits
 * @param {string} fromTabId the tab being switched from.
 * @param {string} toTabId the tab being switched to.
 */
ec.Page.prototype.switchCheckoutTab = function(fromTabId, toTabId) {
  // If switching from billingInfo, send checkout options
  if (fromTabId == 'billingInfo') {
    var selectedPurchaseOption =
        $('input[type="radio"][name="credit"]:checked');
    var option = selectedPurchaseOption.length > 0 ?
        selectedPurchaseOption.val() : '';
    ec.GA.sendCheckoutOption(this.getStepNumber(fromTabId), option);
  }
  this.step = toTabId;
  ec.GA.sendCheckoutStep(this.getStepNumber(toTabId),
      this.cart.getCheckoutItems(), this.type, 'right');

  if (toTabId == 'confirmation') {
    ec.GA.sendTransaction(this.cart.getCheckoutItems(), this.transactionId);
    //backup cart then clear it
    this.cart.backupCart();
    this.cart.clearCart();
    this.showAlert('.transactionAlert');
    // disable all other checkout tabs
    $.each(ec.Page.CHECKOUT_TAB_IDS, function(index, id) {
      if (id != toTabId) {
        $('a[href="#' + id + '"]').parent().addClass('disabled', true);
      }
    });
  }
  // Switch tabs
  $('#checkoutTabs a[href="#' + toTabId + '"]').tab('show');
};

/**
 * Sets the GA code modal text.
 * @param {Function} toStringMethod function returns GTM and EC.js code strings.
 * @param {Array} args arguments for the function passed.
 */
ec.Page.prototype.setModalText = function(toStringMethod, args) {
  this.codeStrings = toStringMethod.apply(this, args);
  $('#code').html(
      window.prettyPrintOne(this.codeStrings[0])
  );
  $('#codeEcJs').html(
      window.prettyPrintOne(this.codeStrings[1])
  );
};

/**
 * Navigates the page to the given loc.
 * @param {string} loc the relative path of the location to go to.
 */
ec.Page.prototype.navigateTo = function(loc) {
  window.location = loc;
};

/**
 * Gets the step number for the step id.
 * @param {string} stepId the id of the step button.
 * @return {number} step number.
 */
ec.Page.prototype.getStepNumber = function(stepId) {
  return ec.Page.CHECKOUT_TAB_IDS.indexOf(stepId) + 1;
};

/**
 * Gets the step title for the step id.
 * @param {string} stepId the id of the step button
 * @return {string} step title
 */
ec.Page.prototype.getStepTitle = function(stepId) {
  var index = this.getStepNumber(stepId) - 1;
  return ec.Page.CHECKOUT_TAB_TITLES[index];
};

/**
 * Gets the product details from the page.
 * @return {{color: string, size: string}} product details.
 */
ec.Page.prototype.getProductViewDetails = function() {
  if (this.type != 'PRODUCT') {return;}
  var result = {};
  var trimColorRadio = $("input[type='radio'][name='color']:checked");
  var sizeRadio = $("input[type='radio'][name='size']:checked");
  result['color'] = trimColorRadio.length > 0 ?
      trimColorRadio.val() : '';
  result['size'] = sizeRadio.length > 0 ?
      sizeRadio.val() : '';
  return result;
};

/**
 * Shows an alert and hides all others.
 * @param {string} className the className of the alert.
 */
ec.Page.prototype.showAlert = function(className) {
  if ($(className) && $(className).hasClass('alert')) {
    $('.alert').hide();
    $(className).show();
    setTimeout(goog.bind($(className).fadeOut, $(className)),
        5000);
  }
};

/**
 * Handles clicks on the page.
 * @param {string} action the action performed.
 * @param {Object} event the event.
 */
ec.Page.prototype.onClick = function(action, event) {
  switch (action) {
      case 'addToCart':
        var detail = this.getProductViewDetails();
        var item = this.cart.addCartItem(this.productId, detail.color,
            detail.size);
        ec.GA.sendAddToCart([item]);
        this.showAlert('.addToCartAlert');
        break;
      case 'removeFromCart':
        var detail = this.getProductViewDetails();
        var item = this.cart.removeCartItem(this.productId, detail.color,
            detail.size);
        var alertClass = '.removeFromCartAlert';
        if (item) {
          ec.GA.sendRemoveFromCart([item]);
        } else {
          alertClass = '.removeFromCartFailAlert';
        }
        this.showAlert(alertClass);
        break;
      case 'clearCart':
        ec.GA.sendRemoveFromCart(this.cart.getCheckoutItems());
        this.cart.clearCart();
        this.showAlert('.clearCartAlert');
        break;
      case 'homepage':
        this.navigateTo('/');
        break;
      case 'checkout':
        this.navigateTo('/checkout');
        break;
      case 'itemLink':
        var id = event.target.id.split('-');
        var items = [this.itemDict[id[1]]];
        if (id[2]) {
          items[0] = $.extend({'position': id[2]}, items[0]);
        }
        if (id[0] == 'promo') {
          ec.GA.sendPromotionClick(this.type, 'banner', id[1]);
        } else {
          ec.GA.sendProductClick(items, id[0],id[1]);
        }

        //this.navigateTo('/item/' + id[1])

        break;
      case 'copyCode':
        var index =
            $('#codeModal .nav-tabs li.active a').attr('href') == '#gtm' ?
            0 : 1;
        $('#copyText').text(this.codeStrings[index]);
        $('#copyText').select();
        break;
      case 'refund':
        var backupCart = this.cart.getBackupCart();
        if (backupCart.length > 0) {
          $('#refundModal').modal('show');
          this.cart.updateCartTotal('#refundForm');
        } else {
          this.showAlert('.refundFailAlert');
        }
        break;
      case 'refundFull':
        ec.GA.sendRefund(this.transactionId);
        this.cart.clearBackupCart();
        this.showAlert('.refundAlert');
        break;
      case 'refundPartial':
        var selected = $.map($("#refundModal input[type='checkbox']:checked"),
            function(item) { return $(item).val()});
        if (selected.length != 0) {
          ec.GA.sendRefundByItem(this.transactionId, this.cart.getBackupCart(),
              selected);
          this.cart.clearBackupCart(selected);
          this.showAlert('.refundAlert');
          $.each($("#refundModal input[type='checkbox']:checked"), function() {
            $(this).parent().parent().parent().remove();
          });
          this.cart.updateCartTotal('#refundForm');
        }
        break;
      case 'checkoutStepButton':
        var ids = event.target.id.split('-');
        this.switchCheckoutTab(ids[0], ids[1]);
        break;
      case 'checkoutStepTab':
        event.stopPropagation();
        var toId = $(event.target).attr('href').substring(1);
        var fromId = $('#checkoutTabs li.active a').attr('href').substring(1);
        //cannot checkout by clicking tab
        if ($(event.target).parent().hasClass('disabled')) { break;}
        this.switchCheckoutTab(fromId, toId);
        break;
      case 'colorRadioButton':
        var color = $(event.target).val();
        $('#itemExample').css('color', color || 'red');
        break;
      case 'sizeRadioButton':
        var size = $(event.target).val();
        $('#itemExample').text(size[0]);
        break;
  }
};

/**
 * Attaches button handlers for the page.
 */
ec.Page.prototype.attachButtonHandlers = function() {
  //addToCart button
  $('#addToCart').click(goog.bind(this.onClick, this, 'addToCart'));

  //removeFromCart button
  $('#removeFromCart').click(goog.bind(this.onClick, this, 'removeFromCart'));

  //clearCart button
  $('#clearCart').click(goog.bind(this.onClick, this, 'clearCart'));

  //checkout button
  $('#checkout').click(goog.bind(this.onClick, this, 'checkout'));

  //refund button
  $('#refund').click(goog.bind(this.onClick, this, 'refund'));

  //refund full button
  $('#refundFull').click(goog.bind(this.onClick, this, 'refundFull'));

  //refund partial button
  $('#refundPartial').click(goog.bind(this.onClick, this, 'refundPartial'));

  //checkout tab navigation
  $('.navSwitch').click(goog.bind(this.onClick, this, 'checkoutStepButton'));

  $('#checkoutTabs a').click(goog.bind(this.onClick, this, 'checkoutStepTab'));

  //item anchor links
  $('.itemLink').click(goog.bind(this.onClick, this, 'itemLink'));

  //Trim color radio buttons
  $("input[type='radio'][name='color']").click(goog.bind(this.onClick, this,
      'colorRadioButton'));
  $("input[type='radio'][name='size']").click(goog.bind(this.onClick, this,
      'sizeRadioButton'));

  //Item picture modal toggle
  $('.GA-tracking').click(goog.bind(this.handleGACodeButton, this));

  //Enable alert hiding
  $('button[data-hide]').click(function() {$(this).parent().hide()});

  // Enable copy button popover
  $('#copyButton').popover({
    'container': '#codeModal .modal-body',
    'content': '<textarea id="copyText">NO CODE</textarea>',
    'html': true,
    'placement': 'left',
    'title': 'Press Ctrl + C to copy!'
  });
  // Close popover on codeModal tab switch
  $('#codeModal a[data-toggle="tab"]').on('shown.bs.tab', function() {
    $('#copyButton').popover('hide');
  });
  // Copy button popover show handler
  $('#copyButton').on('shown.bs.popover', goog.bind(this.onClick, this,
      'copyCode'));
};


/**
 * GA Code button handler. Sets the code modal's text and shows it.
 * @param {Object} event the click event.
 */
ec.Page.prototype.handleGACodeButton = function(event) {
  event.stopPropagation();
  var id = $(event.currentTarget).attr('id');
  if (id.substr(0, 2) != 'GA') { return; }
  var param = id.split('-');
  var source = param[1];
  var items;
  if (param.length > 2) {
    var idParts = id.split('-');
    id = idParts[2];
    items = [this.itemDict[id]];
    if (idParts[3]) {
      items[0] = $.extend({'position': idParts[3]}, items[0]);
    }

  }
  var modalTitle = '';
  switch (source) {
    case 'shirts you may like':
    //fallthrough
    case 'homepage':
      this.setModalText(ec.GA.string.getProductClick, [items, source]);
      modalTitle = 'GA Product Click (link click)';
      break;
    case 'promo':
      this.setModalText(ec.GA.string.getPromotionClick, [this.type, 'banner']);
      modalTitle = 'GA Promotion Click (link click)';
      break;
    case 'product':
      this.setModalText(ec.GA.string.getProductView,
          [items, this.promoList, this.type, 'banner']);
      modalTitle = 'GA Product View with Impressions (onload)';
      break;
    case 'banner':
      this.setModalText(ec.GA.string.getImpressions,
          [items || this.itemsList, this.promoList, this.type, 'banner']);
      modalTitle = 'GA Impressions (onload)';
      break;
    case 'addToCart':
      var detail = this.getProductViewDetails();
      var details = {
        'size' : detail.size || this.cart.defaultSize,
        'variant' : detail.color || this.cart.defaultColor,
        'quantity' : 1
      };
      items[0] = $.extend(details, items[0]);
      this.setModalText(ec.GA.string.getCartAction,
          [items, 'add']);
      modalTitle = 'GA Add To Cart (button click)';
      break;
    case 'removeFromCart':
      var detail = this.getProductViewDetails();
      var details = {
        'size' : detail.size || this.cart.defaultSize,
        'variant' : detail.color || this.cart.defaultColor,
        'quantity' : 1
      };
      items[0] = $.extend(details, items[0]);
      this.setModalText(ec.GA.string.getCartAction,
          [items, 'remove']);
      modalTitle = 'GA Remove From Cart (button click)';
      break;
    case 'clearCart':
      this.setModalText(ec.GA.string.getCartAction,
          [this.cart.getCheckoutItems(), 'remove']);
      modalTitle = 'GA Remove From Cart (button click)';
      break;
    case 'checkoutStep':
      this.setModalText(ec.GA.string.getCheckoutStep,
          [this.getStepNumber(this.step), this.cart.getCheckoutItems(),
           this.type, 'right']);
      modalTitle = 'GA Checkout Step: ' + this.getStepTitle(this.step) +
          ' (on tab switch)';
      break;
    case 'checkoutOption':
      var selectedPurchaseOption =
          $("input[type='radio'][name='credit']:checked");
      var option = selectedPurchaseOption.length > 0 ?
          selectedPurchaseOption.val() : '';
      this.setModalText(ec.GA.string.getCheckoutOption,
          [this.getStepNumber(this.step), option]);
      modalTitle = 'GA Checkout Option: ' + option + ' (on next button)';
      break;
    case 'transaction':
      this.setModalText(ec.GA.string.getTransaction,
          [this.cart.getCheckoutItems(), this.transactionId]);
      modalTitle = 'GA Transaction, ID: ' + this.transactionId +
          ' (on purchase button)';
      break;
    case 'refundFull':
      this.setModalText(ec.GA.string.getRefund,
          [this.transactionId]);
      modalTitle = 'GA Refund, ID: ' + this.transactionId +
          ' (on refund button)';
      $('#codeModal').on('show.bs.modal',
          function() { $('#refundModal').modal('hide');});
      $('#codeModal').on('hidden.bs.modal',
          function() {$('#refundModal').modal('show');});
      break;
    case 'refundPartial':
      var selected = $.map($("#refundModal input[type='checkbox']:checked"),
          function(item) { return $(item).val()});
      this.setModalText(ec.GA.string.getRefund,
          [this.transactionId, this.cart.getBackupCart(), selected]);
      modalTitle = 'GA Partial Refund (on refund button)';
      $('#codeModal').on('show.bs.modal',
          function() { $('#refundModal').modal('hide');});
      $('#codeModal').on('hidden.bs.modal',
          function() {$('#refundModal').modal('show');});
      break;
  }
  $('#myModalLabel').text(modalTitle);
  $('#copyButton').popover('hide');
  $('#codeModal').modal('show');
};

