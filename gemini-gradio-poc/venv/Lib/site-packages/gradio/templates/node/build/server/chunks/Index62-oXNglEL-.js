import { z as assign, A as identity, c as create_ssr_component, v as validate_component, a as createEventDispatcher, s as subscribe, b as add_attribute, e as escape, d as add_styles, B as compute_rest_props, C as spread, D as escape_attribute_value, E as escape_object } from './ssr-Cwm06D-i.js';
import './dispatch-Q6CxlFMN.js';
import { az as now, aA as loop, aB as is_date, B as Block, S as Static, U as UploadText, g as BlockLabel, h as Image, i as Empty, j as IconButtonWrapper, k as IconButton, K as Undo, F as FullscreenButton, D as DownloadLink, n as Download, J as Clear, r as resolve_wasm_src } from './2-BNUpI8q7.js';
import { w as writable } from './index-CoAj_-n5.js';
import { U as Upload } from './ModifyUpload-D4-Q9pOE.js';
import 'tty';
import 'path';
import 'url';
import 'fs';
import './Component-BlohB9Ds.js';

/** @returns {(t: any) => any} */
function get_interpolator(a, b) {
	if (a === b || a !== a) return () => a;
	const type = typeof a;
	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}
	if (Array.isArray(a)) {
		const arr = b.map((bi, i) => {
			return get_interpolator(a[i], bi);
		});
		return (t) => arr.map((fn) => fn(t));
	}
	if (type === 'object') {
		if (!a || !b) throw new Error('Object cannot be null');
		if (is_date(a) && is_date(b)) {
			a = a.getTime();
			b = b.getTime();
			const delta = b - a;
			return (t) => new Date(a + t * delta);
		}
		const keys = Object.keys(b);
		const interpolators = {};
		keys.forEach((key) => {
			interpolators[key] = get_interpolator(a[key], b[key]);
		});
		return (t) => {
			const result = {};
			keys.forEach((key) => {
				result[key] = interpolators[key](t);
			});
			return result;
		};
	}
	if (type === 'number') {
		const delta = b - a;
		return (t) => a + t * delta;
	}
	throw new Error(`Cannot interpolate ${type} values`);
}

/**
 * A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.
 *
 * https://svelte.dev/docs/svelte-motion#tweened
 * @template T
 * @param {T} [value]
 * @param {import('./private.js').TweenedOptions<T>} [defaults]
 * @returns {import('./public.js').Tweened<T>}
 */
function tweened(value, defaults = {}) {
	const store = writable(value);
	/** @type {import('../internal/private.js').Task} */
	let task;
	let target_value = value;
	/**
	 * @param {T} new_value
	 * @param {import('./private.js').TweenedOptions<T>} [opts]
	 */
	function set(new_value, opts) {
		if (value == null) {
			store.set((value = new_value));
			return Promise.resolve();
		}
		target_value = new_value;
		let previous_task = task;
		let started = false;
		let {
			delay = 0,
			duration = 400,
			easing = identity,
			interpolate = get_interpolator
		} = assign(assign({}, defaults), opts);
		if (duration === 0) {
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			store.set((value = target_value));
			return Promise.resolve();
		}
		const start = now() + delay;
		let fn;
		task = loop((now) => {
			if (now < start) return true;
			if (!started) {
				fn = interpolate(value, new_value);
				if (typeof duration === 'function') duration = duration(value, new_value);
				started = true;
			}
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			const elapsed = now - start;
			if (elapsed > /** @type {number} */ (duration)) {
				store.set((value = new_value));
				return false;
			}
			// @ts-ignore
			store.set((value = fn(easing(elapsed / duration))));
			return true;
		});
		return task.promise;
	}
	return {
		set,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe
	};
}

var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
    name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function")
    select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    return array(select2.apply(this, arguments));
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function")
    select2 = arrayAll(select2);
  else
    select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function")
    match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$1(x) {
  return function() {
    return x;
  };
}
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length)
    return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function")
    value = constant$1(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1)
          i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength)
          ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}
function selection_exit() {
  return new Selection(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter)
      enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update)
      update = update.selection();
  }
  if (onexit == null)
    exit.remove();
  else
    onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(context) {
  var selection = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}
function selection_order() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4)
          next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare)
    compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node)
        return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this)
    ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttribute(name);
    else
      this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttributeNS(fullname.space, fullname.local);
    else
      this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.style.removeProperty(name);
    else
      this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      delete this[name];
    else
      this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n)
      if (!list.contains(names[i]))
        return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling)
    this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling)
    this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent)
    parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on)
      return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i)
      on.length = i;
    else
      delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on)
      for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on)
      this.__on = [o];
    else
      on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on)
      for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i)
    this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window = defaultView(node), event = window.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params)
      event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else
      event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        yield node;
    }
  }
}
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection_selection() {
  return this;
}
Selection.prototype = {
  constructor: Selection,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
const css$4 = {
  code: ".wrap.svelte-fpmna9.svelte-fpmna9{position:relative;width:100%;height:100%;z-index:var(--layer-1);overflow:hidden}.icon-wrap.svelte-fpmna9.svelte-fpmna9{display:block;position:absolute;top:50%;transform:translate(-20.5px, -50%);left:10px;width:40px;transition:0.2s;color:var(--body-text-color);height:30px;border-radius:5px;background-color:var(--color-accent);display:flex;align-items:center;justify-content:center;z-index:var(--layer-3);box-shadow:0px 0px 5px 2px rgba(0, 0, 0, 0.3);font-size:12px}.icon.left.svelte-fpmna9.svelte-fpmna9{transform:rotate(135deg);text-shadow:-1px -1px 1px rgba(0, 0, 0, 0.1)}.icon.right.svelte-fpmna9.svelte-fpmna9{transform:rotate(-45deg);text-shadow:-1px -1px 1px rgba(0, 0, 0, 0.1)}.icon.center.svelte-fpmna9.svelte-fpmna9{display:block;width:1px;height:100%;background-color:var(--color);opacity:0.1}.icon-wrap.active.svelte-fpmna9.svelte-fpmna9{opacity:0}.icon-wrap.disabled.svelte-fpmna9.svelte-fpmna9{opacity:0}.outer.svelte-fpmna9.svelte-fpmna9{width:20px;height:100%;position:absolute;cursor:grab;position:absolute;top:0;left:-10px;pointer-events:auto;z-index:var(--layer-2)}.grab.svelte-fpmna9.svelte-fpmna9{cursor:grabbing}.inner.svelte-fpmna9.svelte-fpmna9{width:1px;height:100%;background:var(--color);position:absolute;left:calc((100% - 2px) / 2)}.disabled.svelte-fpmna9.svelte-fpmna9{cursor:auto}.disabled.svelte-fpmna9 .inner.svelte-fpmna9{box-shadow:none}.content.svelte-fpmna9.svelte-fpmna9{width:100%;height:100%;display:flex;justify-content:center;align-items:center}",
  map: '{"version":3,"file":"Slider.svelte","sources":["Slider.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount } from \\"svelte\\";\\nimport { drag } from \\"d3-drag\\";\\nimport { select } from \\"d3-selection\\";\\nfunction clamp(value, min, max) {\\n    return Math.min(Math.max(value, min), max);\\n}\\nexport let position = 0.5;\\nexport let disabled = false;\\nexport let slider_color = \\"var(--border-color-primary)\\";\\nexport let image_size = { top: 0, left: 0, width: 0, height: 0 };\\nexport let el = void 0;\\nexport let parent_el = void 0;\\nlet inner;\\nlet px = 0;\\nlet active = false;\\nlet container_width = 0;\\nfunction set_position(width) {\\n    container_width = parent_el?.getBoundingClientRect().width || 0;\\n    if (width === 0) {\\n        image_size.width = el?.getBoundingClientRect().width || 0;\\n    }\\n    px = clamp(image_size.width * position + image_size.left, 0, container_width);\\n}\\nfunction round(n, points) {\\n    const mod = Math.pow(10, points);\\n    return Math.round((n + Number.EPSILON) * mod) / mod;\\n}\\nfunction update_position(x) {\\n    px = clamp(x, 0, container_width);\\n    position = round((x - image_size.left) / image_size.width, 5);\\n}\\nfunction drag_start(event) {\\n    if (disabled)\\n        return;\\n    active = true;\\n    update_position(event.x);\\n}\\nfunction drag_move(event) {\\n    if (disabled)\\n        return;\\n    update_position(event.x);\\n}\\nfunction drag_end() {\\n    if (disabled)\\n        return;\\n    active = false;\\n}\\nfunction update_position_from_pc(pc) {\\n    px = clamp(image_size.width * pc + image_size.left, 0, container_width);\\n}\\n$: set_position(image_size.width);\\n$: update_position_from_pc(position);\\nonMount(() => {\\n    set_position(image_size.width);\\n    const drag_handler = drag().on(\\"start\\", drag_start).on(\\"drag\\", drag_move).on(\\"end\\", drag_end);\\n    select(inner).call(drag_handler);\\n});\\n<\/script>\\n\\n<svelte:window on:resize={() => set_position(image_size.width)} />\\n\\n<div class=\\"wrap\\" role=\\"none\\" bind:this={parent_el}>\\n\\t<div class=\\"content\\" bind:this={el}>\\n\\t\\t<slot />\\n\\t</div>\\n\\t<div\\n\\t\\tclass=\\"outer\\"\\n\\t\\tclass:disabled\\n\\t\\tbind:this={inner}\\n\\t\\trole=\\"none\\"\\n\\t\\tstyle=\\"transform: translateX({px}px)\\"\\n\\t\\tclass:grab={active}\\n\\t>\\n\\t\\t<span class=\\"icon-wrap\\" class:active class:disabled\\n\\t\\t\\t><span class=\\"icon left\\">◢</span><span\\n\\t\\t\\t\\tclass=\\"icon center\\"\\n\\t\\t\\t\\tstyle:--color={slider_color}\\n\\t\\t\\t></span><span class=\\"icon right\\">◢</span></span\\n\\t\\t>\\n\\t\\t<div class=\\"inner\\" style:--color={slider_color}></div>\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.wrap {\\n\\t\\tposition: relative;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tz-index: var(--layer-1);\\n\\t\\toverflow: hidden;\\n\\t}\\n\\n\\t.icon-wrap {\\n\\t\\tdisplay: block;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 50%;\\n\\t\\ttransform: translate(-20.5px, -50%);\\n\\t\\tleft: 10px;\\n\\t\\twidth: 40px;\\n\\t\\ttransition: 0.2s;\\n\\t\\tcolor: var(--body-text-color);\\n\\t\\theight: 30px;\\n\\t\\tborder-radius: 5px;\\n\\t\\tbackground-color: var(--color-accent);\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: center;\\n\\t\\tz-index: var(--layer-3);\\n\\t\\tbox-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.3);\\n\\t\\tfont-size: 12px;\\n\\t}\\n\\n\\t.icon.left {\\n\\t\\ttransform: rotate(135deg);\\n\\t\\ttext-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);\\n\\t}\\n\\n\\t.icon.right {\\n\\t\\ttransform: rotate(-45deg);\\n\\t\\ttext-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);\\n\\t}\\n\\n\\t.icon.center {\\n\\t\\tdisplay: block;\\n\\t\\twidth: 1px;\\n\\t\\theight: 100%;\\n\\t\\tbackground-color: var(--color);\\n\\t\\topacity: 0.1;\\n\\t}\\n\\n\\t.icon-wrap.active {\\n\\t\\topacity: 0;\\n\\t}\\n\\n\\t.icon-wrap.disabled {\\n\\t\\topacity: 0;\\n\\t}\\n\\n\\t.outer {\\n\\t\\twidth: 20px;\\n\\t\\theight: 100%;\\n\\t\\tposition: absolute;\\n\\t\\tcursor: grab;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: -10px;\\n\\t\\tpointer-events: auto;\\n\\t\\tz-index: var(--layer-2);\\n\\t}\\n\\t.grab {\\n\\t\\tcursor: grabbing;\\n\\t}\\n\\n\\t.inner {\\n\\t\\twidth: 1px;\\n\\t\\theight: 100%;\\n\\t\\tbackground: var(--color);\\n\\t\\tposition: absolute;\\n\\t\\tleft: calc((100% - 2px) / 2);\\n\\t}\\n\\n\\t.disabled {\\n\\t\\tcursor: auto;\\n\\t}\\n\\n\\t.disabled .inner {\\n\\t\\tbox-shadow: none;\\n\\t}\\n\\n\\t.content {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t}</style>\\n"],"names":[],"mappings":"AAoFC,iCAAM,CACL,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,SAAS,CAAC,CACvB,QAAQ,CAAE,MACX,CAEA,sCAAW,CACV,OAAO,CAAE,KAAK,CACd,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,SAAS,CAAE,UAAU,OAAO,CAAC,CAAC,IAAI,CAAC,CACnC,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,iBAAiB,CAAC,CAC7B,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,IAAI,cAAc,CAAC,CACrC,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,OAAO,CAAE,IAAI,SAAS,CAAC,CACvB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAC9C,SAAS,CAAE,IACZ,CAEA,KAAK,iCAAM,CACV,SAAS,CAAE,OAAO,MAAM,CAAC,CACzB,WAAW,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAC7C,CAEA,KAAK,kCAAO,CACX,SAAS,CAAE,OAAO,MAAM,CAAC,CACzB,WAAW,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAC7C,CAEA,KAAK,mCAAQ,CACZ,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,OAAO,CAAC,CAC9B,OAAO,CAAE,GACV,CAEA,UAAU,mCAAQ,CACjB,OAAO,CAAE,CACV,CAEA,UAAU,qCAAU,CACnB,OAAO,CAAE,CACV,CAEA,kCAAO,CACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CACX,cAAc,CAAE,IAAI,CACpB,OAAO,CAAE,IAAI,SAAS,CACvB,CACA,iCAAM,CACL,MAAM,CAAE,QACT,CAEA,kCAAO,CACN,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,OAAO,CAAC,CACxB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,KAAK,CAAC,IAAI,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAC5B,CAEA,qCAAU,CACT,MAAM,CAAE,IACT,CAEA,uBAAS,CAAC,oBAAO,CAChB,UAAU,CAAE,IACb,CAEA,oCAAS,CACR,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MACd"}'
};
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
const Slider = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { position = 0.5 } = $$props;
  let { disabled = false } = $$props;
  let { slider_color = "var(--border-color-primary)" } = $$props;
  let { image_size = { top: 0, left: 0, width: 0, height: 0 } } = $$props;
  let { el = void 0 } = $$props;
  let { parent_el = void 0 } = $$props;
  let inner;
  let px = 0;
  let container_width = 0;
  function set_position(width) {
    container_width = parent_el?.getBoundingClientRect().width || 0;
    if (width === 0) {
      image_size.width = el?.getBoundingClientRect().width || 0;
    }
    px = clamp(image_size.width * position + image_size.left, 0, container_width);
  }
  function update_position_from_pc(pc) {
    px = clamp(image_size.width * pc + image_size.left, 0, container_width);
  }
  if ($$props.position === void 0 && $$bindings.position && position !== void 0)
    $$bindings.position(position);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.slider_color === void 0 && $$bindings.slider_color && slider_color !== void 0)
    $$bindings.slider_color(slider_color);
  if ($$props.image_size === void 0 && $$bindings.image_size && image_size !== void 0)
    $$bindings.image_size(image_size);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  if ($$props.parent_el === void 0 && $$bindings.parent_el && parent_el !== void 0)
    $$bindings.parent_el(parent_el);
  $$result.css.add(css$4);
  {
    set_position(image_size.width);
  }
  {
    update_position_from_pc(position);
  }
  return ` <div class="wrap svelte-fpmna9" role="none"${add_attribute("this", parent_el, 0)}><div class="content svelte-fpmna9"${add_attribute("this", el, 0)}>${slots.default ? slots.default({}) : ``}</div> <div class="${[
    "outer svelte-fpmna9",
    (disabled ? "disabled" : "") + " " + ("")
  ].join(" ").trim()}" role="none" style="${"transform: translateX(" + escape(px, true) + "px)"}"${add_attribute("this", inner, 0)}><span class="${[
    "icon-wrap svelte-fpmna9",
    ("") + " " + (disabled ? "disabled" : "")
  ].join(" ").trim()}"><span class="icon left svelte-fpmna9" data-svelte-h="svelte-9lsvah">◢</span><span class="icon center svelte-fpmna9"${add_styles({ "--color": slider_color })}></span><span class="icon right svelte-fpmna9" data-svelte-h="svelte-1lu38by">◢</span></span> <div class="inner svelte-fpmna9"${add_styles({ "--color": slider_color })}></div></div> </div>`;
});
const css$3 = {
  code: ".preview.svelte-k63p1v{object-fit:contain;width:100%;transform-origin:top left;margin:auto}.small.svelte-k63p1v{max-height:500px}.upload.svelte-k63p1v{object-fit:contain;max-height:500px}.fixed.svelte-k63p1v{position:absolute;top:0;left:0;right:0;bottom:0}.fullscreen.svelte-k63p1v{width:100%;height:100%}.image-container:fullscreen img.svelte-k63p1v{width:100%;height:100%;max-height:none;max-width:none}.hidden.svelte-k63p1v{opacity:0}",
  map: '{"version":3,"file":"ImageEl.svelte","sources":["ImageEl.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { createEventDispatcher, onMount, tick } from \\"svelte\\";\\nimport { resolve_wasm_src } from \\"@gradio/wasm/svelte\\";\\nexport let src = void 0;\\nexport let fullscreen = false;\\nlet resolved_src;\\nexport let fixed = false;\\nexport let transform = \\"translate(0px, 0px) scale(1)\\";\\nexport let img_el = null;\\nexport let hidden = false;\\nexport let variant = \\"upload\\";\\nexport let max_height = 500;\\nlet latest_src;\\n$: {\\n    resolved_src = src;\\n    latest_src = src;\\n    const resolving_src = src;\\n    resolve_wasm_src(resolving_src).then((s) => {\\n        if (latest_src === resolving_src) {\\n            resolved_src = s;\\n        }\\n    });\\n}\\nconst dispatch = createEventDispatcher();\\nfunction get_image_size(img) {\\n    if (!img)\\n        return { top: 0, left: 0, width: 0, height: 0 };\\n    const container = img.parentElement?.getBoundingClientRect();\\n    if (!container)\\n        return { top: 0, left: 0, width: 0, height: 0 };\\n    const naturalAspect = img.naturalWidth / img.naturalHeight;\\n    const containerAspect = container.width / container.height;\\n    let displayedWidth, displayedHeight;\\n    if (naturalAspect > containerAspect) {\\n        displayedWidth = container.width;\\n        displayedHeight = container.width / naturalAspect;\\n    }\\n    else {\\n        displayedHeight = container.height;\\n        displayedWidth = container.height * naturalAspect;\\n    }\\n    const offsetX = (container.width - displayedWidth) / 2;\\n    const offsetY = (container.height - displayedHeight) / 2;\\n    return {\\n        top: offsetY,\\n        left: offsetX,\\n        width: displayedWidth,\\n        height: displayedHeight\\n    };\\n}\\nonMount(() => {\\n    const resizer = new ResizeObserver(async (entries) => {\\n        for (const entry of entries) {\\n            await tick();\\n            dispatch(\\"load\\", get_image_size(img_el));\\n        }\\n    });\\n    resizer.observe(img_el);\\n    return () => {\\n        resizer.disconnect();\\n    };\\n});\\n<\/script>\\n\\n<!-- svelte-ignore a11y-missing-attribute -->\\n<img\\n\\tsrc={resolved_src}\\n\\t{...$$restProps}\\n\\tclass:fixed\\n\\tstyle:transform\\n\\tbind:this={img_el}\\n\\tclass:hidden\\n\\tclass:preview={variant === \\"preview\\"}\\n\\tclass:slider={variant === \\"upload\\"}\\n\\tstyle:max-height={max_height && !fullscreen ? `${max_height}px` : null}\\n\\tclass:fullscreen\\n\\tclass:small={!fullscreen}\\n\\ton:load={() => dispatch(\\"load\\", get_image_size(img_el))}\\n/>\\n\\n<style>\\n\\t.preview {\\n\\t\\tobject-fit: contain;\\n\\t\\twidth: 100%;\\n\\t\\ttransform-origin: top left;\\n\\t\\tmargin: auto;\\n\\t}\\n\\n\\t.small {\\n\\t\\tmax-height: 500px;\\n\\t}\\n\\n\\t.upload {\\n\\t\\tobject-fit: contain;\\n\\t\\tmax-height: 500px;\\n\\t}\\n\\n\\t.fixed {\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\tright: 0;\\n\\t\\tbottom: 0;\\n\\t}\\n\\n\\t.fullscreen {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n\\n\\t:global(.image-container:fullscreen) img {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tmax-height: none;\\n\\t\\tmax-width: none;\\n\\t}\\n\\n\\t.hidden {\\n\\t\\topacity: 0;\\n\\t}</style>\\n"],"names":[],"mappings":"AAgFC,sBAAS,CACR,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,IAAI,CACX,gBAAgB,CAAE,GAAG,CAAC,IAAI,CAC1B,MAAM,CAAE,IACT,CAEA,oBAAO,CACN,UAAU,CAAE,KACb,CAEA,qBAAQ,CACP,UAAU,CAAE,OAAO,CACnB,UAAU,CAAE,KACb,CAEA,oBAAO,CACN,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CACT,CAEA,yBAAY,CACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IACT,CAEQ,2BAA4B,CAAC,iBAAI,CACxC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,IACZ,CAEA,qBAAQ,CACP,OAAO,CAAE,CACV"}'
};
const ImageEl = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "src",
    "fullscreen",
    "fixed",
    "transform",
    "img_el",
    "hidden",
    "variant",
    "max_height"
  ]);
  let { src = void 0 } = $$props;
  let { fullscreen = false } = $$props;
  let resolved_src;
  let { fixed = false } = $$props;
  let { transform = "translate(0px, 0px) scale(1)" } = $$props;
  let { img_el = null } = $$props;
  let { hidden = false } = $$props;
  let { variant = "upload" } = $$props;
  let { max_height = 500 } = $$props;
  let latest_src;
  createEventDispatcher();
  if ($$props.src === void 0 && $$bindings.src && src !== void 0)
    $$bindings.src(src);
  if ($$props.fullscreen === void 0 && $$bindings.fullscreen && fullscreen !== void 0)
    $$bindings.fullscreen(fullscreen);
  if ($$props.fixed === void 0 && $$bindings.fixed && fixed !== void 0)
    $$bindings.fixed(fixed);
  if ($$props.transform === void 0 && $$bindings.transform && transform !== void 0)
    $$bindings.transform(transform);
  if ($$props.img_el === void 0 && $$bindings.img_el && img_el !== void 0)
    $$bindings.img_el(img_el);
  if ($$props.hidden === void 0 && $$bindings.hidden && hidden !== void 0)
    $$bindings.hidden(hidden);
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0)
    $$bindings.variant(variant);
  if ($$props.max_height === void 0 && $$bindings.max_height && max_height !== void 0)
    $$bindings.max_height(max_height);
  $$result.css.add(css$3);
  {
    {
      resolved_src = src;
      latest_src = src;
      const resolving_src = src;
      resolve_wasm_src(resolving_src).then((s) => {
        if (latest_src === resolving_src) {
          resolved_src = s;
        }
      });
    }
  }
  return ` <img${spread(
    [
      {
        src: escape_attribute_value(resolved_src)
      },
      escape_object($$restProps)
    ],
    {
      classes: (fixed ? "fixed" : "") + " " + (hidden ? "hidden" : "") + " " + (variant === "preview" ? "preview" : "") + " " + (variant === "upload" ? "slider" : "") + " " + (fullscreen ? "fullscreen" : "") + " " + (!fullscreen ? "small" : "") + " svelte-k63p1v",
      styles: {
        transform,
        "max-height": max_height && !fullscreen ? `${max_height}px` : null
      }
    }
  )}${add_attribute("this", img_el, 0)}>`;
});
class ZoomableImage {
  container;
  image;
  scale;
  offsetX;
  offsetY;
  isDragging;
  lastX;
  lastY;
  initial_left_padding;
  initial_top_padding;
  initial_width;
  initial_height;
  subscribers;
  handleImageLoad;
  real_image_size = { top: 0, left: 0, width: 0, height: 0 };
  last_touch_distance;
  constructor(container, image) {
    this.container = container;
    this.image = image;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.initial_left_padding = 0;
    this.initial_top_padding = 0;
    this.initial_width = 0;
    this.initial_height = 0;
    this.subscribers = [];
    this.last_touch_distance = 0;
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleImageLoad = this.init.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.image.addEventListener("load", this.handleImageLoad);
    this.container.addEventListener("wheel", this.handleWheel);
    this.container.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
    this.container.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchend", this.handleTouchEnd);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.container) {
          this.handleResize();
          this.get_image_size(this.image);
        }
      }
    });
    observer.observe(this.container);
  }
  handleResize() {
    this.init();
  }
  init() {
    const containerRect = this.container.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    this.initial_left_padding = imageRect.left - containerRect.left;
    this.initial_top_padding = imageRect.top - containerRect.top;
    this.initial_width = imageRect.width;
    this.initial_height = imageRect.height;
    this.reset_zoom();
    this.updateTransform();
  }
  reset_zoom() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.updateTransform();
  }
  handleMouseDown(e) {
    const imageRect = this.image.getBoundingClientRect();
    if (e.clientX >= imageRect.left && e.clientX <= imageRect.right && e.clientY >= imageRect.top && e.clientY <= imageRect.bottom) {
      e.preventDefault();
      if (this.scale === 1)
        return;
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.image.style.cursor = "grabbing";
    }
  }
  handleMouseMove(e) {
    if (!this.isDragging)
      return;
    const deltaX = e.clientX - this.lastX;
    const deltaY = e.clientY - this.lastY;
    this.offsetX += deltaX;
    this.offsetY += deltaY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.updateTransform();
    this.updateTransform();
  }
  handleMouseUp() {
    if (this.isDragging) {
      this.constrain_to_bounds(true);
      this.updateTransform();
      this.isDragging = false;
      this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
    }
  }
  async handleWheel(e) {
    e.preventDefault();
    const containerRect = this.container.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    if (e.clientX < imageRect.left || e.clientX > imageRect.right || e.clientY < imageRect.top || e.clientY > imageRect.bottom) {
      return;
    }
    const zoomFactor = 1.05;
    const oldScale = this.scale;
    const newScale = -Math.sign(e.deltaY) > 0 ? Math.min(15, oldScale * zoomFactor) : Math.max(1, oldScale / zoomFactor);
    if (newScale === oldScale)
      return;
    const cursorX = e.clientX - containerRect.left - this.initial_left_padding;
    const cursorY = e.clientY - containerRect.top - this.initial_top_padding;
    this.scale = newScale;
    this.offsetX = this.compute_new_offset({
      cursor_position: cursorX,
      current_offset: this.offsetX,
      new_scale: newScale,
      old_scale: oldScale
    });
    this.offsetY = this.compute_new_offset({
      cursor_position: cursorY,
      current_offset: this.offsetY,
      new_scale: newScale,
      old_scale: oldScale
    });
    this.updateTransform();
    this.constrain_to_bounds();
    this.updateTransform();
    this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
  }
  // compute_offset_for_positions({ position: number, scale: number }) {
  // 	return position - (scale / this.scale) * (position - this.offset);
  // }
  compute_new_position({
    position,
    scale,
    anchor_position
  }) {
    return position - (position - anchor_position) * (scale / this.scale);
  }
  compute_new_offset({
    cursor_position,
    current_offset,
    new_scale,
    old_scale
  }) {
    return cursor_position - new_scale / old_scale * (cursor_position - current_offset);
  }
  constrain_to_bounds(pan = false) {
    if (this.scale === 1) {
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }
    const onscreen = {
      top: this.real_image_size.top * this.scale + this.offsetY,
      left: this.real_image_size.left * this.scale + this.offsetX,
      width: this.real_image_size.width * this.scale,
      height: this.real_image_size.height * this.scale,
      bottom: this.real_image_size.top * this.scale + this.offsetY + this.real_image_size.height * this.scale,
      right: this.real_image_size.left * this.scale + this.offsetX + this.real_image_size.width * this.scale
    };
    const real_image_size_right = this.real_image_size.left + this.real_image_size.width;
    const real_image_size_bottom = this.real_image_size.top + this.real_image_size.height;
    if (pan) {
      if (onscreen.top > this.real_image_size.top) {
        this.offsetY = this.calculate_position(
          this.real_image_size.top,
          0,
          "y"
        );
      } else if (onscreen.bottom < real_image_size_bottom) {
        this.offsetY = this.calculate_position(real_image_size_bottom, 1, "y");
      }
      if (onscreen.left > this.real_image_size.left) {
        this.offsetX = this.calculate_position(
          this.real_image_size.left,
          0,
          "x"
        );
      } else if (onscreen.right < real_image_size_right) {
        this.offsetX = this.calculate_position(real_image_size_right, 1, "x");
      }
    }
  }
  updateTransform() {
    this.notify({ x: this.offsetX, y: this.offsetY, scale: this.scale });
  }
  destroy() {
    this.container.removeEventListener("wheel", this.handleWheel);
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    this.container.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    this.image.removeEventListener("load", this.handleImageLoad);
  }
  subscribe(cb) {
    this.subscribers.push(cb);
  }
  unsubscribe(cb) {
    this.subscribers = this.subscribers.filter(
      (subscriber) => subscriber !== cb
    );
  }
  notify({ x, y, scale }) {
    this.subscribers.forEach((subscriber) => subscriber({ x, y, scale }));
  }
  handleTouchStart(e) {
    e.preventDefault();
    const imageRect = this.image.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch.clientX >= imageRect.left && touch.clientX <= imageRect.right && touch.clientY >= imageRect.top && touch.clientY <= imageRect.bottom) {
      if (e.touches.length === 1 && this.scale > 1) {
        this.isDragging = true;
        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        this.last_touch_distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    }
  }
  get_image_size(img) {
    if (!img)
      return;
    const container = img.parentElement?.getBoundingClientRect();
    if (!container)
      return;
    const naturalAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = container.width / container.height;
    let displayedWidth, displayedHeight;
    if (naturalAspect > containerAspect) {
      displayedWidth = container.width;
      displayedHeight = container.width / naturalAspect;
    } else {
      displayedHeight = container.height;
      displayedWidth = container.height * naturalAspect;
    }
    const offsetX = (container.width - displayedWidth) / 2;
    const offsetY = (container.height - displayedHeight) / 2;
    this.real_image_size = {
      top: offsetY,
      left: offsetX,
      width: displayedWidth,
      height: displayedHeight
    };
  }
  handleTouchMove(e) {
    if (e.touches.length === 1 && this.isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.lastX;
      const deltaY = touch.clientY - this.lastY;
      this.offsetX += deltaX;
      this.offsetY += deltaY;
      this.lastX = touch.clientX;
      this.lastY = touch.clientY;
      this.updateTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const current_distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      if (this.last_touch_distance === 0) {
        this.last_touch_distance = current_distance;
        return;
      }
      const zoomFactor = current_distance / this.last_touch_distance;
      const oldScale = this.scale;
      const newScale = Math.min(15, Math.max(1, oldScale * zoomFactor));
      if (newScale === oldScale) {
        this.last_touch_distance = current_distance;
        return;
      }
      const containerRect = this.container.getBoundingClientRect();
      const midX = (touch1.clientX + touch2.clientX) / 2 - containerRect.left - this.initial_left_padding;
      const midY = (touch1.clientY + touch2.clientY) / 2 - containerRect.top - this.initial_top_padding;
      this.scale = newScale;
      this.offsetX = this.compute_new_offset({
        cursor_position: midX,
        current_offset: this.offsetX,
        new_scale: newScale,
        old_scale: oldScale
      });
      this.offsetY = this.compute_new_offset({
        cursor_position: midY,
        current_offset: this.offsetY,
        new_scale: newScale,
        old_scale: oldScale
      });
      this.updateTransform();
      this.constrain_to_bounds();
      this.updateTransform();
      this.last_touch_distance = current_distance;
      this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
    }
  }
  handleTouchEnd(e) {
    if (this.isDragging) {
      this.constrain_to_bounds(true);
      this.updateTransform();
      this.isDragging = false;
    }
    if (e.touches.length === 0) {
      this.last_touch_distance = 0;
    }
  }
  calculate_position(screen_coord, image_anchor, axis) {
    this.container.getBoundingClientRect();
    if (axis === "x") {
      const relative_screen_x = screen_coord;
      const anchor_x = this.real_image_size.left + image_anchor * this.real_image_size.width;
      return relative_screen_x - anchor_x * this.scale;
    }
    if (axis === "y") {
      const relative_screen_y = screen_coord;
      const anchor_y = this.real_image_size.top + image_anchor * this.real_image_size.height;
      return relative_screen_y - anchor_y * this.scale;
    }
    return 0;
  }
}
const css$2 = {
  code: ".slider-wrap.svelte-eb87wk{user-select:none;height:100%;width:100%;position:relative;display:flex;align-items:center;justify-content:center}.limit_height.svelte-eb87wk img{max-height:500px}.image-container.svelte-eb87wk{height:100%;position:relative;min-width:var(--size-20)}",
  map: '{"version":3,"file":"SliderPreview.svelte","sources":["SliderPreview.svelte"],"sourcesContent":["<script lang=\\"ts\\">import Slider from \\"./Slider.svelte\\";\\nimport ImageEl from \\"./ImageEl.svelte\\";\\nimport { BlockLabel, Empty, IconButton, IconButtonWrapper, FullscreenButton } from \\"@gradio/atoms\\";\\nimport { Image, Download, Undo, Clear } from \\"@gradio/icons\\";\\nimport {} from \\"@gradio/client\\";\\nimport { DownloadLink } from \\"@gradio/wasm/svelte\\";\\nimport { ZoomableImage } from \\"./zoom\\";\\nimport { onMount } from \\"svelte\\";\\nimport { tweened } from \\"svelte/motion\\";\\nimport { createEventDispatcher } from \\"svelte\\";\\nexport let value = [null, null];\\nexport let label = void 0;\\nexport let show_download_button = true;\\nexport let show_label;\\nexport let i18n;\\nexport let position;\\nexport let layer_images = true;\\nexport let show_single = false;\\nexport let slider_color;\\nexport let show_fullscreen_button = true;\\nexport let el_width = 0;\\nexport let max_height;\\nexport let interactive = true;\\nconst dispatch = createEventDispatcher();\\nlet img;\\nlet slider_wrap;\\nlet image_container;\\nlet transform = tweened({ x: 0, y: 0, z: 1 }, {\\n    duration: 75\\n});\\nlet parent_el;\\n$: coords_at_viewport = get_coords_at_viewport(position, viewport_width, image_size.width, image_size.left, $transform.x, $transform.z);\\n$: style = layer_images ? `clip-path: inset(0 0 0 ${coords_at_viewport * 100}%)` : \\"\\";\\nfunction get_coords_at_viewport(viewport_percent_x, viewportWidth, image_width, img_offset_x, tx, scale) {\\n    const px_relative_to_image = viewport_percent_x * image_width;\\n    const pixel_position = px_relative_to_image + img_offset_x;\\n    const normalised_position = (pixel_position - tx) / scale;\\n    const percent_position = normalised_position / viewportWidth;\\n    return percent_position;\\n}\\nlet img_width = 0;\\nlet viewport_width = 0;\\nlet zoomable_image = null;\\nlet observer = null;\\nfunction init_image(img2, slider_wrap2) {\\n    if (!img2 || !slider_wrap2)\\n        return;\\n    zoomable_image?.destroy();\\n    observer?.disconnect();\\n    img_width = img2?.getBoundingClientRect().width || 0;\\n    viewport_width = slider_wrap2?.getBoundingClientRect().width || 0;\\n    zoomable_image = new ZoomableImage(slider_wrap2, img2);\\n    zoomable_image.subscribe(({ x, y, scale }) => {\\n        transform.set({ x, y, z: scale });\\n    });\\n    observer = new ResizeObserver((entries) => {\\n        for (const entry of entries) {\\n            if (entry.target === slider_wrap2) {\\n                viewport_width = entry.contentRect.width;\\n            }\\n            if (entry.target === img2) {\\n                img_width = entry.contentRect.width;\\n            }\\n        }\\n    });\\n    observer.observe(slider_wrap2);\\n    observer.observe(img2);\\n}\\n$: init_image(img, slider_wrap);\\nonMount(() => {\\n    return () => {\\n        zoomable_image?.destroy();\\n        observer?.disconnect();\\n    };\\n});\\nlet is_full_screen = false;\\nlet slider_wrap_parent;\\nlet image_size = { top: 0, left: 0, width: 0, height: 0 };\\nfunction handle_image_load(event) {\\n    image_size = event.detail;\\n}\\n<\/script>\\n\\n<BlockLabel {show_label} Icon={Image} label={label || i18n(\\"image.image\\")} />\\n{#if (value === null || value[0] === null || value[1] === null) && !show_single}\\n\\t<Empty unpadded_box={true} size=\\"large\\"><Image /></Empty>\\n{:else}\\n\\t<div class=\\"image-container\\" bind:this={image_container}>\\n\\t\\t<IconButtonWrapper>\\n\\t\\t\\t<IconButton\\n\\t\\t\\t\\tIcon={Undo}\\n\\t\\t\\t\\tlabel={i18n(\\"common.undo\\")}\\n\\t\\t\\t\\tdisabled={$transform.z === 1}\\n\\t\\t\\t\\ton:click={() => zoomable_image?.reset_zoom()}\\n\\t\\t\\t/>\\n\\t\\t\\t{#if show_fullscreen_button}\\n\\t\\t\\t\\t<FullscreenButton container={image_container} bind:is_full_screen />\\n\\t\\t\\t{/if}\\n\\n\\t\\t\\t{#if show_download_button}\\n\\t\\t\\t\\t<DownloadLink\\n\\t\\t\\t\\t\\thref={value[1]?.url}\\n\\t\\t\\t\\t\\tdownload={value[1]?.orig_name || \\"image\\"}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<IconButton Icon={Download} label={i18n(\\"common.download\\")} />\\n\\t\\t\\t\\t</DownloadLink>\\n\\t\\t\\t{/if}\\n\\t\\t\\t{#if interactive}\\n\\t\\t\\t\\t<IconButton\\n\\t\\t\\t\\t\\tIcon={Clear}\\n\\t\\t\\t\\t\\tlabel=\\"Remove Image\\"\\n\\t\\t\\t\\t\\ton:click={(event) => {\\n\\t\\t\\t\\t\\t\\tvalue = [null, null];\\n\\t\\t\\t\\t\\t\\tdispatch(\\"clear\\");\\n\\t\\t\\t\\t\\t\\tevent.stopPropagation();\\n\\t\\t\\t\\t\\t}}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t{/if}\\n\\t\\t</IconButtonWrapper>\\n\\t\\t<div\\n\\t\\t\\tclass=\\"slider-wrap\\"\\n\\t\\t\\tbind:this={slider_wrap_parent}\\n\\t\\t\\tbind:clientWidth={el_width}\\n\\t\\t\\tclass:limit_height={!is_full_screen}\\n\\t\\t>\\n\\t\\t\\t<Slider\\n\\t\\t\\t\\tbind:position\\n\\t\\t\\t\\t{slider_color}\\n\\t\\t\\t\\tbind:el={slider_wrap}\\n\\t\\t\\t\\tbind:parent_el\\n\\t\\t\\t\\t{image_size}\\n\\t\\t\\t>\\n\\t\\t\\t\\t<ImageEl\\n\\t\\t\\t\\t\\tsrc={value?.[0]?.url}\\n\\t\\t\\t\\t\\talt=\\"\\"\\n\\t\\t\\t\\t\\tloading=\\"lazy\\"\\n\\t\\t\\t\\t\\tbind:img_el={img}\\n\\t\\t\\t\\t\\tvariant=\\"preview\\"\\n\\t\\t\\t\\t\\ttransform=\\"translate({$transform.x}px, {$transform.y}px) scale({$transform.z})\\"\\n\\t\\t\\t\\t\\tfullscreen={is_full_screen}\\n\\t\\t\\t\\t\\t{max_height}\\n\\t\\t\\t\\t\\ton:load={handle_image_load}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<ImageEl\\n\\t\\t\\t\\t\\tvariant=\\"preview\\"\\n\\t\\t\\t\\t\\tfixed={layer_images}\\n\\t\\t\\t\\t\\thidden={!value?.[1]?.url}\\n\\t\\t\\t\\t\\tsrc={value?.[1]?.url}\\n\\t\\t\\t\\t\\talt=\\"\\"\\n\\t\\t\\t\\t\\tloading=\\"lazy\\"\\n\\t\\t\\t\\t\\t{style}\\n\\t\\t\\t\\t\\ttransform=\\"translate({$transform.x}px, {$transform.y}px) scale({$transform.z})\\"\\n\\t\\t\\t\\t\\tfullscreen={is_full_screen}\\n\\t\\t\\t\\t\\t{max_height}\\n\\t\\t\\t\\t\\ton:load={handle_image_load}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t</Slider>\\n\\t\\t</div>\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t.slider-wrap {\\n\\t\\tuser-select: none;\\n\\t\\theight: 100%;\\n\\t\\twidth: 100%;\\n\\t\\tposition: relative;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: center;\\n\\t}\\n\\n\\t.limit_height :global(img) {\\n\\t\\tmax-height: 500px;\\n\\t}\\n\\n\\t.image-container {\\n\\t\\theight: 100%;\\n\\t\\tposition: relative;\\n\\t\\tmin-width: var(--size-20);\\n\\t}</style>\\n"],"names":[],"mappings":"AAkKC,0BAAa,CACZ,WAAW,CAAE,IAAI,CACjB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAClB,CAEA,2BAAa,CAAS,GAAK,CAC1B,UAAU,CAAE,KACb,CAEA,8BAAiB,CAChB,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,IAAI,SAAS,CACzB"}'
};
function get_coords_at_viewport(viewport_percent_x, viewportWidth, image_width, img_offset_x, tx, scale) {
  const px_relative_to_image = viewport_percent_x * image_width;
  const pixel_position = px_relative_to_image + img_offset_x;
  const normalised_position = (pixel_position - tx) / scale;
  const percent_position = normalised_position / viewportWidth;
  return percent_position;
}
const SliderPreview = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let coords_at_viewport;
  let style;
  let $transform, $$unsubscribe_transform;
  let { value = [null, null] } = $$props;
  let { label = void 0 } = $$props;
  let { show_download_button = true } = $$props;
  let { show_label } = $$props;
  let { i18n } = $$props;
  let { position } = $$props;
  let { layer_images = true } = $$props;
  let { show_single = false } = $$props;
  let { slider_color } = $$props;
  let { show_fullscreen_button = true } = $$props;
  let { el_width = 0 } = $$props;
  let { max_height } = $$props;
  let { interactive = true } = $$props;
  createEventDispatcher();
  let img;
  let slider_wrap;
  let image_container;
  let transform = tweened({ x: 0, y: 0, z: 1 }, { duration: 75 });
  $$unsubscribe_transform = subscribe(transform, (value2) => $transform = value2);
  let parent_el;
  let viewport_width = 0;
  let zoomable_image = null;
  let observer = null;
  function init_image(img2, slider_wrap2) {
    if (!img2 || !slider_wrap2)
      return;
    zoomable_image?.destroy();
    observer?.disconnect();
    img2?.getBoundingClientRect().width || 0;
    viewport_width = slider_wrap2?.getBoundingClientRect().width || 0;
    zoomable_image = new ZoomableImage(slider_wrap2, img2);
    zoomable_image.subscribe(({ x, y, scale }) => {
      transform.set({ x, y, z: scale });
    });
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === slider_wrap2) {
          viewport_width = entry.contentRect.width;
        }
        if (entry.target === img2) {
          entry.contentRect.width;
        }
      }
    });
    observer.observe(slider_wrap2);
    observer.observe(img2);
  }
  let is_full_screen = false;
  let slider_wrap_parent;
  let image_size = { top: 0, left: 0, width: 0, height: 0 };
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.show_download_button === void 0 && $$bindings.show_download_button && show_download_button !== void 0)
    $$bindings.show_download_button(show_download_button);
  if ($$props.show_label === void 0 && $$bindings.show_label && show_label !== void 0)
    $$bindings.show_label(show_label);
  if ($$props.i18n === void 0 && $$bindings.i18n && i18n !== void 0)
    $$bindings.i18n(i18n);
  if ($$props.position === void 0 && $$bindings.position && position !== void 0)
    $$bindings.position(position);
  if ($$props.layer_images === void 0 && $$bindings.layer_images && layer_images !== void 0)
    $$bindings.layer_images(layer_images);
  if ($$props.show_single === void 0 && $$bindings.show_single && show_single !== void 0)
    $$bindings.show_single(show_single);
  if ($$props.slider_color === void 0 && $$bindings.slider_color && slider_color !== void 0)
    $$bindings.slider_color(slider_color);
  if ($$props.show_fullscreen_button === void 0 && $$bindings.show_fullscreen_button && show_fullscreen_button !== void 0)
    $$bindings.show_fullscreen_button(show_fullscreen_button);
  if ($$props.el_width === void 0 && $$bindings.el_width && el_width !== void 0)
    $$bindings.el_width(el_width);
  if ($$props.max_height === void 0 && $$bindings.max_height && max_height !== void 0)
    $$bindings.max_height(max_height);
  if ($$props.interactive === void 0 && $$bindings.interactive && interactive !== void 0)
    $$bindings.interactive(interactive);
  $$result.css.add(css$2);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    coords_at_viewport = get_coords_at_viewport(position, viewport_width, image_size.width, image_size.left, $transform.x, $transform.z);
    style = layer_images ? `clip-path: inset(0 0 0 ${coords_at_viewport * 100}%)` : "";
    {
      init_image(img, slider_wrap);
    }
    $$rendered = `${validate_component(BlockLabel, "BlockLabel").$$render(
      $$result,
      {
        show_label,
        Icon: Image,
        label: label || i18n("image.image")
      },
      {},
      {}
    )} ${(value === null || value[0] === null || value[1] === null) && !show_single ? `${validate_component(Empty, "Empty").$$render($$result, { unpadded_box: true, size: "large" }, {}, {
      default: () => {
        return `${validate_component(Image, "Image").$$render($$result, {}, {}, {})}`;
      }
    })}` : `<div class="image-container svelte-eb87wk"${add_attribute("this", image_container, 0)}>${validate_component(IconButtonWrapper, "IconButtonWrapper").$$render($$result, {}, {}, {
      default: () => {
        return `${validate_component(IconButton, "IconButton").$$render(
          $$result,
          {
            Icon: Undo,
            label: i18n("common.undo"),
            disabled: $transform.z === 1
          },
          {},
          {}
        )} ${show_fullscreen_button ? `${validate_component(FullscreenButton, "FullscreenButton").$$render(
          $$result,
          {
            container: image_container,
            is_full_screen
          },
          {
            is_full_screen: ($$value) => {
              is_full_screen = $$value;
              $$settled = false;
            }
          },
          {}
        )}` : ``} ${show_download_button ? `${validate_component(DownloadLink, "DownloadLink").$$render(
          $$result,
          {
            href: value[1]?.url,
            download: value[1]?.orig_name || "image"
          },
          {},
          {
            default: () => {
              return `${validate_component(IconButton, "IconButton").$$render(
                $$result,
                {
                  Icon: Download,
                  label: i18n("common.download")
                },
                {},
                {}
              )}`;
            }
          }
        )}` : ``} ${interactive ? `${validate_component(IconButton, "IconButton").$$render($$result, { Icon: Clear, label: "Remove Image" }, {}, {})}` : ``}`;
      }
    })} <div class="${["slider-wrap svelte-eb87wk", !is_full_screen ? "limit_height" : ""].join(" ").trim()}"${add_attribute("this", slider_wrap_parent, 0)}>${validate_component(Slider, "Slider").$$render(
      $$result,
      {
        slider_color,
        image_size,
        position,
        el: slider_wrap,
        parent_el
      },
      {
        position: ($$value) => {
          position = $$value;
          $$settled = false;
        },
        el: ($$value) => {
          slider_wrap = $$value;
          $$settled = false;
        },
        parent_el: ($$value) => {
          parent_el = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(ImageEl, "ImageEl").$$render(
            $$result,
            {
              src: value?.[0]?.url,
              alt: "",
              loading: "lazy",
              variant: "preview",
              transform: "translate(" + $transform.x + "px, " + $transform.y + "px) scale(" + $transform.z + ")",
              fullscreen: is_full_screen,
              max_height,
              img_el: img
            },
            {
              img_el: ($$value) => {
                img = $$value;
                $$settled = false;
              }
            },
            {}
          )} ${validate_component(ImageEl, "ImageEl").$$render(
            $$result,
            {
              variant: "preview",
              fixed: layer_images,
              hidden: !value?.[1]?.url,
              src: value?.[1]?.url,
              alt: "",
              loading: "lazy",
              style,
              transform: "translate(" + $transform.x + "px, " + $transform.y + "px) scale(" + $transform.z + ")",
              fullscreen: is_full_screen,
              max_height
            },
            {},
            {}
          )}`;
        }
      }
    )}</div></div>`}`;
  } while (!$$settled);
  $$unsubscribe_transform();
  return $$rendered;
});
const css$1 = {
  code: "div.svelte-s6ybro{display:flex;position:absolute;top:var(--size-2);right:var(--size-2);justify-content:flex-end;gap:var(--spacing-sm);z-index:var(--layer-5)}",
  map: '{"version":3,"file":"ClearImage.svelte","sources":["ClearImage.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { createEventDispatcher } from \\"svelte\\";\\nimport { IconButton } from \\"@gradio/atoms\\";\\nimport { Clear } from \\"@gradio/icons\\";\\nconst dispatch = createEventDispatcher();\\n<\/script>\\n\\n<div>\\n\\t<IconButton\\n\\t\\tIcon={Clear}\\n\\t\\tlabel=\\"Remove Image\\"\\n\\t\\ton:click={(event) => {\\n\\t\\t\\tdispatch(\\"remove_image\\");\\n\\t\\t\\tevent.stopPropagation();\\n\\t\\t}}\\n\\t/>\\n</div>\\n\\n<style>\\n\\tdiv {\\n\\t\\tdisplay: flex;\\n\\t\\tposition: absolute;\\n\\t\\ttop: var(--size-2);\\n\\t\\tright: var(--size-2);\\n\\t\\tjustify-content: flex-end;\\n\\t\\tgap: var(--spacing-sm);\\n\\t\\tz-index: var(--layer-5);\\n\\t}</style>\\n"],"names":[],"mappings":"AAkBC,iBAAI,CACH,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,QAAQ,CAAC,CAClB,KAAK,CAAE,IAAI,QAAQ,CAAC,CACpB,eAAe,CAAE,QAAQ,CACzB,GAAG,CAAE,IAAI,YAAY,CAAC,CACtB,OAAO,CAAE,IAAI,SAAS,CACvB"}'
};
const ClearImage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  $$result.css.add(css$1);
  return `<div class="svelte-s6ybro">${validate_component(IconButton, "IconButton").$$render($$result, { Icon: Clear, label: "Remove Image" }, {}, {})} </div>`;
});
const css = {
  code: ".upload-wrap.svelte-143b07a{display:flex;justify-content:center;align-items:center;height:100%;width:100%}.wrap.svelte-143b07a{width:100%}.half-wrap.svelte-143b07a{width:50%}.image-container.svelte-143b07a,.empty-wrap.svelte-143b07a{width:var(--size-full);height:var(--size-full)}.fixed.svelte-143b07a{--anim-block-background-fill:255, 255, 255;position:absolute;top:0;left:0;background-color:rgba(var(--anim-block-background-fill), 0.8);z-index:0}@media(prefers-color-scheme: dark){.fixed.svelte-143b07a{--anim-block-background-fill:31, 41, 55}}.side-by-side.svelte-143b07a img{width:50%;object-fit:contain}.empty-wrap.svelte-143b07a{pointer-events:none}.icon-buttons.svelte-143b07a{display:flex;position:absolute;right:8px;z-index:var(--layer-top);top:8px}",
  map: '{"version":3,"file":"Image.svelte","sources":["Image.svelte"],"sourcesContent":["<script lang=\\"ts\\">import Slider from \\"./Slider.svelte\\";\\nimport { createEventDispatcher, tick } from \\"svelte\\";\\nimport { BlockLabel, Empty, IconButton } from \\"@gradio/atoms\\";\\nimport { Download } from \\"@gradio/icons\\";\\nimport { Image } from \\"@gradio/icons\\";\\nimport {} from \\"@gradio/utils\\";\\nimport ClearImage from \\"./ClearImage.svelte\\";\\nimport ImageEl from \\"./ImageEl.svelte\\";\\nimport { Upload } from \\"@gradio/upload\\";\\nimport { DownloadLink } from \\"@gradio/wasm/svelte\\";\\nimport {} from \\"@gradio/client\\";\\nexport let value;\\nexport let label = void 0;\\nexport let show_label;\\nexport let root;\\nexport let position;\\nexport let upload_count = 2;\\nexport let show_download_button = true;\\nexport let slider_color;\\nexport let upload;\\nexport let stream_handler;\\nexport let max_file_size = null;\\nexport let i18n;\\nexport let max_height;\\nlet value_ = value || [null, null];\\nlet img;\\nlet el_width;\\nlet el_height;\\nasync function handle_upload({ detail }, n) {\\n    const new_value = [value[0], value[1]];\\n    if (detail.length > 1) {\\n        new_value[n] = detail[0];\\n    }\\n    else {\\n        new_value[n] = detail[n];\\n    }\\n    value = new_value;\\n    await tick();\\n    dispatch(\\"upload\\", new_value);\\n}\\nlet old_value = \\"\\";\\n$: if (JSON.stringify(value) !== old_value) {\\n    old_value = JSON.stringify(value);\\n    value_ = value;\\n}\\nconst dispatch = createEventDispatcher();\\nexport let dragging = false;\\n$: dispatch(\\"drag\\", dragging);\\n<\/script>\\n\\n<BlockLabel {show_label} Icon={Image} label={label || i18n(\\"image.image\\")} />\\n\\n<div\\n\\tdata-testid=\\"image\\"\\n\\tclass=\\"image-container\\"\\n\\tbind:clientWidth={el_width}\\n\\tbind:clientHeight={el_height}\\n>\\n\\t{#if value?.[0]?.url || value?.[1]?.url}\\n\\t\\t<ClearImage\\n\\t\\t\\ton:remove_image={() => {\\n\\t\\t\\t\\tposition = 0.5;\\n\\t\\t\\t\\tvalue = [null, null];\\n\\t\\t\\t\\tdispatch(\\"clear\\");\\n\\t\\t\\t}}\\n\\t\\t/>\\n\\t{/if}\\n\\t{#if value?.[1]?.url}\\n\\t\\t<div class=\\"icon-buttons\\">\\n\\t\\t\\t{#if show_download_button}\\n\\t\\t\\t\\t<DownloadLink\\n\\t\\t\\t\\t\\thref={value[1].url}\\n\\t\\t\\t\\t\\tdownload={value[1].orig_name || \\"image\\"}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<IconButton Icon={Download} />\\n\\t\\t\\t\\t</DownloadLink>\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t{/if}\\n\\t<Slider\\n\\t\\tbind:position\\n\\t\\tdisabled={upload_count == 2 || !value?.[0]}\\n\\t\\t{slider_color}\\n\\t>\\n\\t\\t<div\\n\\t\\t\\tclass=\\"upload-wrap\\"\\n\\t\\t\\tstyle:display={upload_count === 2 ? \\"flex\\" : \\"block\\"}\\n\\t\\t\\tclass:side-by-side={upload_count === 2}\\n\\t\\t>\\n\\t\\t\\t{#if !value_?.[0]}\\n\\t\\t\\t\\t<div class=\\"wrap\\" class:half-wrap={upload_count === 1}>\\n\\t\\t\\t\\t\\t<Upload\\n\\t\\t\\t\\t\\t\\tbind:dragging\\n\\t\\t\\t\\t\\t\\tfiletype=\\"image/*\\"\\n\\t\\t\\t\\t\\t\\ton:load={(e) => handle_upload(e, 0)}\\n\\t\\t\\t\\t\\t\\tdisable_click={!!value?.[0]}\\n\\t\\t\\t\\t\\t\\t{root}\\n\\t\\t\\t\\t\\t\\tfile_count=\\"multiple\\"\\n\\t\\t\\t\\t\\t\\t{upload}\\n\\t\\t\\t\\t\\t\\t{stream_handler}\\n\\t\\t\\t\\t\\t\\t{max_file_size}\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t<slot />\\n\\t\\t\\t\\t\\t</Upload>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\t<ImageEl\\n\\t\\t\\t\\t\\tvariant=\\"upload\\"\\n\\t\\t\\t\\t\\tsrc={value_[0]?.url}\\n\\t\\t\\t\\t\\talt=\\"\\"\\n\\t\\t\\t\\t\\tbind:img_el={img}\\n\\t\\t\\t\\t\\t{max_height}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t{/if}\\n\\n\\t\\t\\t{#if !value_?.[1] && upload_count === 2}\\n\\t\\t\\t\\t<Upload\\n\\t\\t\\t\\t\\tbind:dragging\\n\\t\\t\\t\\t\\tfiletype=\\"image/*\\"\\n\\t\\t\\t\\t\\ton:load={(e) => handle_upload(e, 1)}\\n\\t\\t\\t\\t\\tdisable_click={!!value?.[1]}\\n\\t\\t\\t\\t\\t{root}\\n\\t\\t\\t\\t\\tfile_count=\\"multiple\\"\\n\\t\\t\\t\\t\\t{upload}\\n\\t\\t\\t\\t\\t{stream_handler}\\n\\t\\t\\t\\t\\t{max_file_size}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<slot />\\n\\t\\t\\t\\t</Upload>\\n\\t\\t\\t{:else if !value_?.[1] && upload_count === 1}\\n\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\tclass=\\"empty-wrap fixed\\"\\n\\t\\t\\t\\t\\tstyle:width=\\"{el_width * (1 - position)}px\\"\\n\\t\\t\\t\\t\\tstyle:transform=\\"translateX({el_width * position}px)\\"\\n\\t\\t\\t\\t\\tclass:white-icon={!value?.[0]?.url}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<Empty unpadded_box={true} size=\\"large\\"><Image /></Empty>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{:else if value_?.[1]}\\n\\t\\t\\t\\t<ImageEl\\n\\t\\t\\t\\t\\tvariant=\\"upload\\"\\n\\t\\t\\t\\t\\tsrc={value_[1].url}\\n\\t\\t\\t\\t\\talt=\\"\\"\\n\\t\\t\\t\\t\\tfixed={upload_count === 1}\\n\\t\\t\\t\\t\\ttransform=\\"translate(0px, 0px) scale(1)\\"\\n\\t\\t\\t\\t\\t{max_height}\\n\\t\\t\\t\\t/>\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t</Slider>\\n</div>\\n\\n<style>\\n\\t.upload-wrap {\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\theight: 100%;\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.wrap {\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.half-wrap {\\n\\t\\twidth: 50%;\\n\\t}\\n\\t.image-container,\\n\\t.empty-wrap {\\n\\t\\twidth: var(--size-full);\\n\\t\\theight: var(--size-full);\\n\\t}\\n\\n\\t.fixed {\\n\\t\\t--anim-block-background-fill: 255, 255, 255;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t\\tbackground-color: rgba(var(--anim-block-background-fill), 0.8);\\n\\t\\tz-index: 0;\\n\\t}\\n\\n\\t@media (prefers-color-scheme: dark) {\\n\\t\\t.fixed {\\n\\t\\t\\t--anim-block-background-fill: 31, 41, 55;\\n\\t\\t}\\n\\t}\\n\\n\\t.side-by-side :global(img) {\\n\\t\\t/* width: 100%; */\\n\\t\\twidth: 50%;\\n\\t\\tobject-fit: contain;\\n\\t}\\n\\n\\t.empty-wrap {\\n\\t\\tpointer-events: none;\\n\\t}\\n\\n\\t.icon-buttons {\\n\\t\\tdisplay: flex;\\n\\t\\tposition: absolute;\\n\\t\\tright: 8px;\\n\\t\\tz-index: var(--layer-top);\\n\\t\\ttop: 8px;\\n\\t}</style>\\n"],"names":[],"mappings":"AAyJC,2BAAa,CACZ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IACR,CAEA,oBAAM,CACL,KAAK,CAAE,IACR,CAEA,yBAAW,CACV,KAAK,CAAE,GACR,CACA,+BAAgB,CAChB,0BAAY,CACX,KAAK,CAAE,IAAI,WAAW,CAAC,CACvB,MAAM,CAAE,IAAI,WAAW,CACxB,CAEA,qBAAO,CACN,4BAA4B,CAAE,aAAa,CAC3C,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,gBAAgB,CAAE,KAAK,IAAI,4BAA4B,CAAC,CAAC,CAAC,GAAG,CAAC,CAC9D,OAAO,CAAE,CACV,CAEA,MAAO,uBAAuB,IAAI,CAAE,CACnC,qBAAO,CACN,4BAA4B,CAAE,UAC/B,CACD,CAEA,4BAAa,CAAS,GAAK,CAE1B,KAAK,CAAE,GAAG,CACV,UAAU,CAAE,OACb,CAEA,0BAAY,CACX,cAAc,CAAE,IACjB,CAEA,4BAAc,CACb,OAAO,CAAE,IAAI,CACb,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,GAAG,CACV,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,GAAG,CAAE,GACN"}'
};
const Image_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value } = $$props;
  let { label = void 0 } = $$props;
  let { show_label } = $$props;
  let { root: root2 } = $$props;
  let { position } = $$props;
  let { upload_count = 2 } = $$props;
  let { show_download_button = true } = $$props;
  let { slider_color } = $$props;
  let { upload } = $$props;
  let { stream_handler } = $$props;
  let { max_file_size = null } = $$props;
  let { i18n } = $$props;
  let { max_height } = $$props;
  let value_ = value || [null, null];
  let img;
  let el_width;
  let old_value = "";
  const dispatch2 = createEventDispatcher();
  let { dragging = false } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.show_label === void 0 && $$bindings.show_label && show_label !== void 0)
    $$bindings.show_label(show_label);
  if ($$props.root === void 0 && $$bindings.root && root2 !== void 0)
    $$bindings.root(root2);
  if ($$props.position === void 0 && $$bindings.position && position !== void 0)
    $$bindings.position(position);
  if ($$props.upload_count === void 0 && $$bindings.upload_count && upload_count !== void 0)
    $$bindings.upload_count(upload_count);
  if ($$props.show_download_button === void 0 && $$bindings.show_download_button && show_download_button !== void 0)
    $$bindings.show_download_button(show_download_button);
  if ($$props.slider_color === void 0 && $$bindings.slider_color && slider_color !== void 0)
    $$bindings.slider_color(slider_color);
  if ($$props.upload === void 0 && $$bindings.upload && upload !== void 0)
    $$bindings.upload(upload);
  if ($$props.stream_handler === void 0 && $$bindings.stream_handler && stream_handler !== void 0)
    $$bindings.stream_handler(stream_handler);
  if ($$props.max_file_size === void 0 && $$bindings.max_file_size && max_file_size !== void 0)
    $$bindings.max_file_size(max_file_size);
  if ($$props.i18n === void 0 && $$bindings.i18n && i18n !== void 0)
    $$bindings.i18n(i18n);
  if ($$props.max_height === void 0 && $$bindings.max_height && max_height !== void 0)
    $$bindings.max_height(max_height);
  if ($$props.dragging === void 0 && $$bindings.dragging && dragging !== void 0)
    $$bindings.dragging(dragging);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (JSON.stringify(value) !== old_value) {
        old_value = JSON.stringify(value);
        value_ = value;
      }
    }
    {
      dispatch2("drag", dragging);
    }
    $$rendered = `${validate_component(BlockLabel, "BlockLabel").$$render(
      $$result,
      {
        show_label,
        Icon: Image,
        label: label || i18n("image.image")
      },
      {},
      {}
    )} <div data-testid="image" class="image-container svelte-143b07a">${value?.[0]?.url || value?.[1]?.url ? `${validate_component(ClearImage, "ClearImage").$$render($$result, {}, {}, {})}` : ``} ${value?.[1]?.url ? `<div class="icon-buttons svelte-143b07a">${show_download_button ? `${validate_component(DownloadLink, "DownloadLink").$$render(
      $$result,
      {
        href: value[1].url,
        download: value[1].orig_name || "image"
      },
      {},
      {
        default: () => {
          return `${validate_component(IconButton, "IconButton").$$render($$result, { Icon: Download }, {}, {})}`;
        }
      }
    )}` : ``}</div>` : ``} ${validate_component(Slider, "Slider").$$render(
      $$result,
      {
        disabled: upload_count == 2 || !value?.[0],
        slider_color,
        position
      },
      {
        position: ($$value) => {
          position = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `<div class="${["upload-wrap svelte-143b07a", upload_count === 2 ? "side-by-side" : ""].join(" ").trim()}"${add_styles({
            "display": upload_count === 2 ? "flex" : "block"
          })}>${!value_?.[0] ? `<div class="${["wrap svelte-143b07a", upload_count === 1 ? "half-wrap" : ""].join(" ").trim()}">${validate_component(Upload, "Upload").$$render(
            $$result,
            {
              filetype: "image/*",
              disable_click: !!value?.[0],
              root: root2,
              file_count: "multiple",
              upload,
              stream_handler,
              max_file_size,
              dragging
            },
            {
              dragging: ($$value) => {
                dragging = $$value;
                $$settled = false;
              }
            },
            {
              default: () => {
                return `${slots.default ? slots.default({}) : ``}`;
              }
            }
          )}</div>` : `${validate_component(ImageEl, "ImageEl").$$render(
            $$result,
            {
              variant: "upload",
              src: value_[0]?.url,
              alt: "",
              max_height,
              img_el: img
            },
            {
              img_el: ($$value) => {
                img = $$value;
                $$settled = false;
              }
            },
            {}
          )}`} ${!value_?.[1] && upload_count === 2 ? `${validate_component(Upload, "Upload").$$render(
            $$result,
            {
              filetype: "image/*",
              disable_click: !!value?.[1],
              root: root2,
              file_count: "multiple",
              upload,
              stream_handler,
              max_file_size,
              dragging
            },
            {
              dragging: ($$value) => {
                dragging = $$value;
                $$settled = false;
              }
            },
            {
              default: () => {
                return `${slots.default ? slots.default({}) : ``}`;
              }
            }
          )}` : `${!value_?.[1] && upload_count === 1 ? `<div class="${[
            "empty-wrap fixed svelte-143b07a",
            !value?.[0]?.url ? "white-icon" : ""
          ].join(" ").trim()}"${add_styles({
            "width": `${el_width * (1 - position)}px`,
            "transform": `translateX(${el_width * position}px)`
          })}>${validate_component(Empty, "Empty").$$render($$result, { unpadded_box: true, size: "large" }, {}, {
            default: () => {
              return `${validate_component(Image, "Image").$$render($$result, {}, {}, {})}`;
            }
          })}</div>` : `${value_?.[1] ? `${validate_component(ImageEl, "ImageEl").$$render(
            $$result,
            {
              variant: "upload",
              src: value_[1].url,
              alt: "",
              fixed: upload_count === 1,
              transform: "translate(0px, 0px) scale(1)",
              max_height
            },
            {},
            {}
          )}` : ``}`}`}</div>`;
        }
      }
    )} </div>`;
  } while (!$$settled);
  return $$rendered;
});
const SliderUpload = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value = [null, null] } = $$props;
  let { upload } = $$props;
  let { stream_handler } = $$props;
  let { label } = $$props;
  let { show_label } = $$props;
  let { i18n } = $$props;
  let { root: root2 } = $$props;
  let { upload_count = 1 } = $$props;
  let { dragging } = $$props;
  let { max_height } = $$props;
  let { max_file_size = null } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.upload === void 0 && $$bindings.upload && upload !== void 0)
    $$bindings.upload(upload);
  if ($$props.stream_handler === void 0 && $$bindings.stream_handler && stream_handler !== void 0)
    $$bindings.stream_handler(stream_handler);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.show_label === void 0 && $$bindings.show_label && show_label !== void 0)
    $$bindings.show_label(show_label);
  if ($$props.i18n === void 0 && $$bindings.i18n && i18n !== void 0)
    $$bindings.i18n(i18n);
  if ($$props.root === void 0 && $$bindings.root && root2 !== void 0)
    $$bindings.root(root2);
  if ($$props.upload_count === void 0 && $$bindings.upload_count && upload_count !== void 0)
    $$bindings.upload_count(upload_count);
  if ($$props.dragging === void 0 && $$bindings.dragging && dragging !== void 0)
    $$bindings.dragging(dragging);
  if ($$props.max_height === void 0 && $$bindings.max_height && max_height !== void 0)
    $$bindings.max_height(max_height);
  if ($$props.max_file_size === void 0 && $$bindings.max_file_size && max_file_size !== void 0)
    $$bindings.max_file_size(max_file_size);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `  ${validate_component(Image_1, "Image").$$render(
      $$result,
      {
        slider_color: "var(--border-color-primary)",
        position: 0.5,
        root: root2,
        label,
        show_label,
        upload_count,
        stream_handler,
        upload,
        max_file_size,
        max_height,
        i18n,
        value,
        dragging
      },
      {
        value: ($$value) => {
          value = $$value;
          $$settled = false;
        },
        dragging: ($$value) => {
          dragging = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${slots.default ? slots.default({}) : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
let uploading = false;
const Index = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let normalised_slider_position;
  let { value_is_output = false } = $$props;
  let { elem_id = "" } = $$props;
  let { elem_classes = [] } = $$props;
  let { visible = true } = $$props;
  let { value = [null, null] } = $$props;
  let old_value = [null, null];
  let { label } = $$props;
  let { show_label } = $$props;
  let { show_download_button } = $$props;
  let { root: root2 } = $$props;
  let { height } = $$props;
  let { width } = $$props;
  let { container = true } = $$props;
  let { scale = null } = $$props;
  let { min_width = void 0 } = $$props;
  let { loading_status } = $$props;
  let { interactive } = $$props;
  let { placeholder = void 0 } = $$props;
  let { show_fullscreen_button } = $$props;
  let { input_ready } = $$props;
  let { slider_position } = $$props;
  let { upload_count = 1 } = $$props;
  let { slider_color = "var(--border-color-primary)" } = $$props;
  let { max_height } = $$props;
  let { gradio } = $$props;
  let dragging;
  let upload_component;
  if ($$props.value_is_output === void 0 && $$bindings.value_is_output && value_is_output !== void 0)
    $$bindings.value_is_output(value_is_output);
  if ($$props.elem_id === void 0 && $$bindings.elem_id && elem_id !== void 0)
    $$bindings.elem_id(elem_id);
  if ($$props.elem_classes === void 0 && $$bindings.elem_classes && elem_classes !== void 0)
    $$bindings.elem_classes(elem_classes);
  if ($$props.visible === void 0 && $$bindings.visible && visible !== void 0)
    $$bindings.visible(visible);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.show_label === void 0 && $$bindings.show_label && show_label !== void 0)
    $$bindings.show_label(show_label);
  if ($$props.show_download_button === void 0 && $$bindings.show_download_button && show_download_button !== void 0)
    $$bindings.show_download_button(show_download_button);
  if ($$props.root === void 0 && $$bindings.root && root2 !== void 0)
    $$bindings.root(root2);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.container === void 0 && $$bindings.container && container !== void 0)
    $$bindings.container(container);
  if ($$props.scale === void 0 && $$bindings.scale && scale !== void 0)
    $$bindings.scale(scale);
  if ($$props.min_width === void 0 && $$bindings.min_width && min_width !== void 0)
    $$bindings.min_width(min_width);
  if ($$props.loading_status === void 0 && $$bindings.loading_status && loading_status !== void 0)
    $$bindings.loading_status(loading_status);
  if ($$props.interactive === void 0 && $$bindings.interactive && interactive !== void 0)
    $$bindings.interactive(interactive);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.show_fullscreen_button === void 0 && $$bindings.show_fullscreen_button && show_fullscreen_button !== void 0)
    $$bindings.show_fullscreen_button(show_fullscreen_button);
  if ($$props.input_ready === void 0 && $$bindings.input_ready && input_ready !== void 0)
    $$bindings.input_ready(input_ready);
  if ($$props.slider_position === void 0 && $$bindings.slider_position && slider_position !== void 0)
    $$bindings.slider_position(slider_position);
  if ($$props.upload_count === void 0 && $$bindings.upload_count && upload_count !== void 0)
    $$bindings.upload_count(upload_count);
  if ($$props.slider_color === void 0 && $$bindings.slider_color && slider_color !== void 0)
    $$bindings.slider_color(slider_color);
  if ($$props.max_height === void 0 && $$bindings.max_height && max_height !== void 0)
    $$bindings.max_height(max_height);
  if ($$props.gradio === void 0 && $$bindings.gradio && gradio !== void 0)
    $$bindings.gradio(gradio);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    normalised_slider_position = Math.max(0, Math.min(100, slider_position)) / 100;
    input_ready = !uploading;
    {
      {
        if (JSON.stringify(value) !== JSON.stringify(old_value)) {
          old_value = value;
          gradio.dispatch("change");
          if (!value_is_output) {
            gradio.dispatch("input");
          }
        }
      }
    }
    $$rendered = `  ${!interactive || value?.[1] && value?.[0] ? `${validate_component(Block, "Block").$$render(
      $$result,
      {
        visible,
        variant: "solid",
        border_mode: dragging ? "focus" : "base",
        padding: false,
        elem_id,
        elem_classes,
        height: height || void 0,
        width,
        allow_overflow: false,
        container,
        scale,
        min_width
      },
      {},
      {
        default: () => {
          return `${validate_component(Static, "StatusTracker").$$render($$result, Object.assign({}, { autoscroll: gradio.autoscroll }, { i18n: gradio.i18n }, loading_status), {}, {})} ${validate_component(SliderPreview, "StaticImage").$$render(
            $$result,
            {
              interactive,
              label,
              show_label,
              show_download_button,
              i18n: gradio.i18n,
              show_fullscreen_button,
              position: normalised_slider_position,
              slider_color,
              max_height,
              value
            },
            {
              value: ($$value) => {
                value = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}` : `${validate_component(Block, "Block").$$render(
      $$result,
      {
        visible,
        variant: value === null ? "dashed" : "solid",
        border_mode: dragging ? "focus" : "base",
        padding: false,
        elem_id,
        elem_classes,
        height: height || void 0,
        width,
        allow_overflow: false,
        container,
        scale,
        min_width
      },
      {},
      {
        default: () => {
          return `${validate_component(Static, "StatusTracker").$$render($$result, Object.assign({}, { autoscroll: gradio.autoscroll }, { i18n: gradio.i18n }, loading_status), {}, {})} ${validate_component(SliderUpload, "ImageUploader").$$render(
            $$result,
            {
              root: root2,
              label,
              show_label,
              upload_count,
              max_file_size: gradio.max_file_size,
              i18n: gradio.i18n,
              upload: (...args) => gradio.client.upload(...args),
              stream_handler: gradio.client?.stream,
              max_height,
              this: upload_component,
              value,
              dragging
            },
            {
              this: ($$value) => {
                upload_component = $$value;
                $$settled = false;
              },
              value: ($$value) => {
                value = $$value;
                $$settled = false;
              },
              dragging: ($$value) => {
                dragging = $$value;
                $$settled = false;
              }
            },
            {
              default: () => {
                return `${`${validate_component(UploadText, "UploadText").$$render(
                  $$result,
                  {
                    i18n: gradio.i18n,
                    type: "image",
                    placeholder
                  },
                  {},
                  {}
                )}`}`;
              }
            }
          )}`;
        }
      }
    )}`}`;
  } while (!$$settled);
  return $$rendered;
});

export { Index as default };
//# sourceMappingURL=Index62-oXNglEL-.js.map
