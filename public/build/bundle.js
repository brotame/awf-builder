
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var Pages;
    (function (Pages) {
        Pages[Pages["HOME"] = 0] = "HOME";
        Pages[Pages["MSF"] = 1] = "MSF";
        Pages[Pages["LOGIC"] = 2] = "LOGIC";
        Pages[Pages["CODE"] = 3] = "CODE";
    })(Pages || (Pages = {}));

    const currentPage = writable(Pages.HOME);

    /* src\icons\intro-icon.svg generated by Svelte v3.24.1 */

    function create_fragment(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;

    	let svg_levels = [
    		{ viewBox: "0 0 34 30" },
    		{ stroke: "currentColor" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					viewbox: true,
    					stroke: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);

    			path0 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path0).forEach(detach);

    			path1 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path1).forEach(detach);

    			path2 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path2).forEach(detach);

    			path3 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path3).forEach(detach);

    			path4 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path4).forEach(detach);

    			path5 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path5).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path0, "d", "M0.800049 5.8H32.8");
    			attr(path0, "stroke-width", "1.5");
    			attr(path0, "stroke-miterlimit", "10");
    			attr(path0, "stroke-linecap", "round");
    			attr(path0, "stroke-linejoin", "round");
    			attr(path1, "d", "M29.8 28.8H3.80005C2.10005 28.8 0.800049 27.5 0.800049\r\n    25.8V3.8C0.800049 2.1 2.10005 0.800003 3.80005 0.800003H29.8C31.5\r\n    0.800003 32.8 2.1 32.8 3.8V25.8C32.8 27.4 31.4 28.8 29.8 28.8Z");
    			attr(path1, "stroke-width", "1.5");
    			attr(path1, "stroke-miterlimit", "10");
    			attr(path1, "stroke-linecap", "round");
    			attr(path1, "stroke-linejoin", "round");
    			attr(path2, "d", "M14.8 20.8H5.80005V24.8H14.8V20.8Z");
    			attr(path2, "stroke-width", "1.5");
    			attr(path2, "stroke-miterlimit", "10");
    			attr(path2, "stroke-linecap", "round");
    			attr(path2, "stroke-linejoin", "round");
    			attr(path3, "d", "M27.8 9.8H5.80005V16.8H27.8V9.8Z");
    			attr(path3, "stroke-width", "1.5");
    			attr(path3, "stroke-miterlimit", "10");
    			attr(path3, "stroke-linecap", "round");
    			attr(path3, "stroke-linejoin", "round");
    			attr(path4, "d", "M17.8 20.8H27.8");
    			attr(path4, "stroke-width", "1.5");
    			attr(path4, "stroke-miterlimit", "10");
    			attr(path4, "stroke-linecap", "round");
    			attr(path4, "stroke-linejoin", "round");
    			attr(path5, "d", "M17.8 24.8H27.8");
    			attr(path5, "stroke-width", "1.5");
    			attr(path5, "stroke-miterlimit", "10");
    			attr(path5, "stroke-linecap", "round");
    			attr(path5, "stroke-linejoin", "round");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    			append(svg, path2);
    			append(svg, path3);
    			append(svg, path4);
    			append(svg, path5);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 34 30" },
    				{ stroke: "currentColor" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class IntroIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    /* src\icons\multi-steps-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$1(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;

    	let svg_levels = [
    		{ viewBox: "0 0 42 34" },
    		{ stroke: "currentColor" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					viewbox: true,
    					stroke: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);

    			path0 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path0).forEach(detach);

    			path1 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path1).forEach(detach);

    			path2 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path2).forEach(detach);

    			path3 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path3).forEach(detach);

    			path4 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path4).forEach(detach);

    			path5 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path5).forEach(detach);

    			path6 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path6).forEach(detach);

    			path7 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path7).forEach(detach);

    			path8 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path8).forEach(detach);

    			path9 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path9).forEach(detach);

    			path10 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path10).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path0, "d", "M0.800049 27.7H8.80005");
    			attr(path0, "stroke-width", "1.5");
    			attr(path0, "stroke-miterlimit", "10");
    			attr(path0, "stroke-linecap", "round");
    			attr(path0, "stroke-linejoin", "round");
    			attr(path1, "d", "M8.80005 24.8H0.800049V32.8H8.80005V24.8Z");
    			attr(path1, "stroke-width", "1.5");
    			attr(path1, "stroke-miterlimit", "10");
    			attr(path1, "stroke-linecap", "round");
    			attr(path1, "stroke-linejoin", "round");
    			attr(path2, "d", "M16.8 27.7H24.8");
    			attr(path2, "stroke-width", "1.5");
    			attr(path2, "stroke-miterlimit", "10");
    			attr(path2, "stroke-linecap", "round");
    			attr(path2, "stroke-linejoin", "round");
    			attr(path3, "d", "M24.8 24.8H16.8V32.8H24.8V24.8Z");
    			attr(path3, "stroke-width", "1.5");
    			attr(path3, "stroke-miterlimit", "10");
    			attr(path3, "stroke-linecap", "round");
    			attr(path3, "stroke-linejoin", "round");
    			attr(path4, "d", "M32.8 27.7H40.8");
    			attr(path4, "stroke-width", "1.5");
    			attr(path4, "stroke-miterlimit", "10");
    			attr(path4, "stroke-linecap", "round");
    			attr(path4, "stroke-linejoin", "round");
    			attr(path5, "d", "M40.8 24.8H32.8V32.8H40.8V24.8Z");
    			attr(path5, "stroke-width", "1.5");
    			attr(path5, "stroke-miterlimit", "10");
    			attr(path5, "stroke-linecap", "round");
    			attr(path5, "stroke-linejoin", "round");
    			attr(path6, "d", "M20.8 19.8V24.8");
    			attr(path6, "stroke-width", "1.5");
    			attr(path6, "stroke-miterlimit", "10");
    			attr(path6, "stroke-linecap", "round");
    			attr(path6, "stroke-linejoin", "round");
    			attr(path7, "d", "M10.6 17.6L6.49995 19.9C5.39995 20.5 4.69995 21.7 4.69995 23V24.8");
    			attr(path7, "stroke-width", "1.5");
    			attr(path7, "stroke-miterlimit", "10");
    			attr(path7, "stroke-linecap", "round");
    			attr(path7, "stroke-linejoin", "round");
    			attr(path8, "d", "M30.9001 17.6L35.0001 19.9C36.1001 20.5 36.8001 21.7 36.8001\r\n    23V24.8");
    			attr(path8, "stroke-width", "1.5");
    			attr(path8, "stroke-miterlimit", "10");
    			attr(path8, "stroke-linecap", "round");
    			attr(path8, "stroke-linejoin", "round");
    			attr(path9, "d", "M21.2001 11.8C18.1001 12 16.6001 8.4 19.0001 6.4C19.4001 6.1\r\n    19.9001 5.9 20.4001 5.8C23.5001 5.6 25.0001 9.2 22.6001 11.2C22.2001\r\n    11.5 21.7001 11.7 21.2001 11.8Z");
    			attr(path9, "stroke-width", "1.5");
    			attr(path9, "stroke-miterlimit", "10");
    			attr(path9, "stroke-linecap", "round");
    			attr(path9, "stroke-linejoin", "round");
    			attr(path10, "d", "M27.2 7.2C27 6.5 26.7 5.8 26.4 5.2L27.2 3.9L25.6 2.3L24.3\r\n    3.1C23.7 2.7 23 2.4 22.3 2.3L21.9 0.800003H19.6L19.2 2.3C18.5 2.5\r\n    17.8 2.8 17.2 3.1L15.9 2.3L14.3 3.9L15.1 5.2C14.7 5.8 14.4 6.5 14.3\r\n    7.2L12.8 7.6V9.9L14.3 10.3C14.5 11 14.8 11.7 15.1 12.3L14.3\r\n    13.6L15.9 15.2L17.2 14.4C17.8 14.8 18.5 15.1 19.2 15.2L19.6\r\n    16.7H21.9L22.3 15.2C23 15 23.7 14.7 24.3 14.4L25.6 15.2L27.2\r\n    13.6L26.4 12.3C26.8 11.7 27.1 11 27.2 10.3L28.7 9.9V7.6L27.2 7.2Z");
    			attr(path10, "stroke-width", "1.5");
    			attr(path10, "stroke-miterlimit", "10");
    			attr(path10, "stroke-linecap", "round");
    			attr(path10, "stroke-linejoin", "round");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    			append(svg, path2);
    			append(svg, path3);
    			append(svg, path4);
    			append(svg, path5);
    			append(svg, path6);
    			append(svg, path7);
    			append(svg, path8);
    			append(svg, path9);
    			append(svg, path10);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 42 34" },
    				{ stroke: "currentColor" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MultiStepsIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src\icons\conditional-logic-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$2(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;

    	let svg_levels = [
    		{ viewBox: "0 0 38 38" },
    		{ stroke: "currentColor" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					viewbox: true,
    					stroke: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);

    			path0 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path0).forEach(detach);

    			path1 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path1).forEach(detach);

    			path2 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path2).forEach(detach);

    			path3 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path3).forEach(detach);

    			path4 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path4).forEach(detach);

    			path5 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path5).forEach(detach);

    			path6 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path6).forEach(detach);

    			path7 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path7).forEach(detach);

    			path8 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path8).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path0, "d", "M21.5 6H13.5C12.1 6 11 4.9 11 3.5C11 2.1 12.1 1 13.5 1H21.5C22.9\r\n    1 24 2.1 24 3.5C24 4.8 22.8 6 21.5 6Z");
    			attr(path0, "stroke-width", "1.5");
    			attr(path0, "stroke-miterlimit", "10");
    			attr(path0, "stroke-linecap", "round");
    			attr(path0, "stroke-linejoin", "round");
    			attr(path1, "d", "M18 26V28");
    			attr(path1, "stroke-width", "1.5");
    			attr(path1, "stroke-miterlimit", "10");
    			attr(path1, "stroke-linecap", "round");
    			attr(path1, "stroke-linejoin", "round");
    			attr(path2, "d", "M8 17H6C3.8 17 2 18.8 2 21C2 23.2 3.8 25 6 25H33V28");
    			attr(path2, "stroke-width", "1.5");
    			attr(path2, "stroke-miterlimit", "10");
    			attr(path2, "stroke-linecap", "round");
    			attr(path2, "stroke-linejoin", "round");
    			attr(path3, "d", "M27 3H33V11");
    			attr(path3, "stroke-width", "1.5");
    			attr(path3, "stroke-miterlimit", "10");
    			attr(path3, "stroke-linecap", "round");
    			attr(path3, "stroke-linejoin", "round");
    			attr(path4, "d", "M17.6999 13.9L22.9999 17L17.6999 20L12.3999 17L17.6999 13.9Z");
    			attr(path4, "stroke-width", "1.5");
    			attr(path4, "stroke-miterlimit", "10");
    			attr(path4, "stroke-linecap", "round");
    			attr(path4, "stroke-linejoin", "round");
    			attr(path5, "d", "M18 8V11");
    			attr(path5, "stroke-width", "1.5");
    			attr(path5, "stroke-miterlimit", "10");
    			attr(path5, "stroke-linecap", "round");
    			attr(path5, "stroke-linejoin", "round");
    			attr(path6, "d", "M36 14H29V19H36V14Z");
    			attr(path6, "stroke-width", "1.5");
    			attr(path6, "stroke-miterlimit", "10");
    			attr(path6, "stroke-linecap", "round");
    			attr(path6, "stroke-linejoin", "round");
    			attr(path7, "d", "M30 34C30 32.3 31.3 31 33 31C34.7 31 36 32.3 36 34C36 35.7 34.7\r\n    37 33 37C31.3 37 30 35.6 30 34Z");
    			attr(path7, "stroke-width", "1.5");
    			attr(path7, "stroke-miterlimit", "10");
    			attr(path7, "stroke-linecap", "round");
    			attr(path7, "stroke-linejoin", "round");
    			attr(path8, "d", "M18 37C16.3 37 15 35.7 15 34C15 32.3 16.3 31 18 31C19.7 31 21\r\n    32.3 21 34C21 35.6 19.6 37 18 37Z");
    			attr(path8, "stroke-width", "1.5");
    			attr(path8, "stroke-miterlimit", "10");
    			attr(path8, "stroke-linecap", "round");
    			attr(path8, "stroke-linejoin", "round");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    			append(svg, path2);
    			append(svg, path3);
    			append(svg, path4);
    			append(svg, path5);
    			append(svg, path6);
    			append(svg, path7);
    			append(svg, path8);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 38 38" },
    				{ stroke: "currentColor" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class ConditionalLogicIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* src\icons\generate-code-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$3(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;

    	let svg_levels = [
    		{ viewBox: "0 0 34 30" },
    		{ stroke: "currentColor" },
    		{ fill: "none" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					viewbox: true,
    					stroke: true,
    					fill: true,
    					xmlns: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);

    			path0 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path0).forEach(detach);

    			path1 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path1).forEach(detach);

    			path2 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path2).forEach(detach);

    			path3 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path3).forEach(detach);

    			path4 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path4).forEach(detach);

    			path5 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path5).forEach(detach);

    			path6 = claim_element(
    				svg_nodes,
    				"path",
    				{
    					d: true,
    					"stroke-width": true,
    					"stroke-miterlimit": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true
    				},
    				1
    			);

    			children(path6).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path0, "d", "M0.800049 5.8H32.8");
    			attr(path0, "stroke-width", "1.5");
    			attr(path0, "stroke-miterlimit", "10");
    			attr(path0, "stroke-linecap", "round");
    			attr(path0, "stroke-linejoin", "round");
    			attr(path1, "d", "M6.80005 15.8L4.80005 13.8L6.80005 11.8");
    			attr(path1, "stroke-width", "1.5");
    			attr(path1, "stroke-miterlimit", "10");
    			attr(path1, "stroke-linecap", "round");
    			attr(path1, "stroke-linejoin", "round");
    			attr(path2, "d", "M14.8 11.8L16.8 13.8L14.8 15.8");
    			attr(path2, "stroke-width", "1.5");
    			attr(path2, "stroke-miterlimit", "10");
    			attr(path2, "stroke-linecap", "round");
    			attr(path2, "stroke-linejoin", "round");
    			attr(path3, "d", "M11.8 9.8L9.80005 17.8");
    			attr(path3, "stroke-width", "1.5");
    			attr(path3, "stroke-miterlimit", "10");
    			attr(path3, "stroke-linecap", "round");
    			attr(path3, "stroke-linejoin", "round");
    			attr(path4, "d", "M16.8 28.8H3.80005C2.10005 28.8 0.800049 27.5 0.800049\r\n    25.8V3.8C0.800049 2.1 2.10005 0.800003 3.80005 0.800003H29.8C31.5\r\n    0.800003 32.8 2.1 32.8 3.8V12.8");
    			attr(path4, "stroke-width", "1.5");
    			attr(path4, "stroke-miterlimit", "10");
    			attr(path4, "stroke-linecap", "round");
    			attr(path4, "stroke-linejoin", "round");
    			attr(path5, "d", "M28.2001 16.9C26.2001 16.4 24.0001 16.9 22.5001 18.5C20.2001 20.8\r\n    20.2001 24.6 22.5001 27L24.2001 25.3");
    			attr(path5, "stroke-width", "1.5");
    			attr(path5, "stroke-miterlimit", "10");
    			attr(path5, "stroke-linecap", "round");
    			attr(path5, "stroke-linejoin", "round");
    			attr(path6, "d", "M25.1001 28.5C27.1001 29.1 29.4001 28.6 31.0001 27C33.3001 24.7\r\n    33.3001 20.9 31.0001 18.5L29.3001 20.2");
    			attr(path6, "stroke-width", "1.5");
    			attr(path6, "stroke-miterlimit", "10");
    			attr(path6, "stroke-linecap", "round");
    			attr(path6, "stroke-linejoin", "round");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    			append(svg, path2);
    			append(svg, path3);
    			append(svg, path4);
    			append(svg, path5);
    			append(svg, path6);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 34 30" },
    				{ stroke: "currentColor" },
    				{ fill: "none" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class GenerateCodeIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* src\ui\NavLink.svelte generated by Svelte v3.24.1 */
    const file = "src\\ui\\NavLink.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let div0;
    	let switch_instance;
    	let t0;
    	let div1;
    	let t1;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*icons*/ ctx[4][/*link*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*text*/ ctx[1]);
    			attr_dev(div0, "class", "nav-icon");
    			add_location(div0, file, 31, 2, 803);
    			attr_dev(div1, "class", "nav-text");
    			add_location(div1, file, 34, 2, 884);
    			attr_dev(button, "class", button_class_value = "nav-item w-inline-block " + /*extraClass*/ ctx[2]);
    			toggle_class(button, "w--current", /*$currentPage*/ ctx[3] === /*link*/ ctx[0]);
    			add_location(button, file, 27, 0, 657);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			append_dev(button, t0);
    			append_dev(button, div1);
    			append_dev(div1, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*icons*/ ctx[4][/*link*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty & /*text*/ 2) set_data_dev(t1, /*text*/ ctx[1]);

    			if (!current || dirty & /*extraClass*/ 4 && button_class_value !== (button_class_value = "nav-item w-inline-block " + /*extraClass*/ ctx[2])) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*extraClass, $currentPage, link*/ 13) {
    				toggle_class(button, "w--current", /*$currentPage*/ ctx[3] === /*link*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $currentPage;
    	validate_store(currentPage, "currentPage");
    	component_subscribe($$self, currentPage, $$value => $$invalidate(3, $currentPage = $$value));
    	
    	let { link } = $$props, { text } = $$props, { extraClass = "" } = $$props;

    	// Variables
    	const icons = [IntroIcon, MultiStepsIcon, ConditionalLogicIcon, GenerateCodeIcon];

    	const writable_props = ["link", "text", "extraClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavLink> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NavLink", $$slots, []);
    	const click_handler = () => set_store_value(currentPage, $currentPage = link);

    	$$self.$$set = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("extraClass" in $$props) $$invalidate(2, extraClass = $$props.extraClass);
    	};

    	$$self.$capture_state = () => ({
    		currentPage,
    		link,
    		text,
    		extraClass,
    		IntroIcon,
    		MultiStepsIcon,
    		ConditionalLogicIcon,
    		GenerateCodeIcon,
    		icons,
    		$currentPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("extraClass" in $$props) $$invalidate(2, extraClass = $$props.extraClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [link, text, extraClass, $currentPage, icons, click_handler];
    }

    class NavLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { link: 0, text: 1, extraClass: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavLink",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*link*/ ctx[0] === undefined && !("link" in props)) {
    			console.warn("<NavLink> was created without expected prop 'link'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<NavLink> was created without expected prop 'text'");
    		}
    	}

    	get link() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extraClass() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extraClass(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\icons\logo.svg generated by Svelte v3.24.1 */

    function create_fragment$5(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 128 128" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M93.1648 128H20.2534C9.088 128 0 118.912 0 107.747V20.2534C0 9.088\r\n    9.088 0 20.2534 0H93.1648C112.372 0 128 15.6262 128 34.8352C128\r\n    47.0259 121.706 57.7741 112.197 64C121.706 70.2259 128 80.9741 128\r\n    93.1648C128 112.374 112.372 128 93.1648 128ZM20.2534 11.3421C17.8908\r\n    11.3448 15.6258 12.2845 13.9552 13.9552C12.2845 15.6258 11.3448\r\n    17.8908 11.3421 20.2534V107.747C11.3448 110.109 12.2845 112.374\r\n    13.9552 114.045C15.6258 115.715 17.8908 116.655 20.2534\r\n    116.658H93.1648C106.118 116.658 116.658 106.118 116.658\r\n    93.1648C116.658 81.9648 108.782 72.5709 98.2771 70.231C95.3318 86.4768\r\n    81.0816 98.8352 64 98.8352C62.4961 98.8352 61.0538 98.2378 59.9904\r\n    97.1744C58.927 96.111 58.3296 94.6687 58.3296 93.1648C58.3296 80.9741\r\n    64.6221 70.2259 74.1325 64C64.6221 57.7741 58.3296 47.0259 58.3296\r\n    34.8352C58.3296 33.3313 58.927 31.889 59.9904 30.8256C61.0538 29.7622\r\n    62.4961 29.1648 64 29.1648C81.0816 29.1648 95.3318 41.5232 98.2771\r\n    57.769C108.782 55.4291 116.658 46.0352 116.658 34.8352C116.658 21.8816\r\n    106.118 11.3421 93.1648 11.3421H20.2534ZM86.5446 70.6202C82.7734\r\n    71.737 79.3411 73.7788 76.56 76.56C73.7788 79.3411 71.737 82.7734\r\n    70.6202 86.5446C74.3913 85.4276 77.8235 83.3857 80.6046\r\n    80.6046C83.3857 77.8235 85.4276 74.3913 86.5446 70.6202ZM70.6202\r\n    41.4554C71.737 45.2266 73.7788 48.6589 76.56 51.4401C79.3411 54.2212\r\n    82.7734 56.263 86.5446 57.3798C85.4276 53.6087 83.3857 50.1765 80.6046\r\n    47.3954C77.8235 44.6143 74.3913 42.5724 70.6202 41.4554Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 128 128" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Logo extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* src\ui\Nav.svelte generated by Svelte v3.24.1 */
    const file$1 = "src\\ui\\Nav.svelte";

    function create_fragment$6(ctx) {
    	let header;
    	let a0;
    	let logo;
    	let t0;
    	let nav;
    	let navlink0;
    	let t1;
    	let navlink1;
    	let t2;
    	let navlink2;
    	let t3;
    	let navlink3;
    	let t4;
    	let p;
    	let t5;
    	let a1;
    	let t7;
    	let current;
    	logo = new Logo({ props: { class: "logo" }, $$inline: true });

    	navlink0 = new NavLink({
    			props: { link: Pages.HOME, text: "Intro" },
    			$$inline: true
    		});

    	navlink1 = new NavLink({
    			props: { link: Pages.MSF, text: "Multi Steps" },
    			$$inline: true
    		});

    	navlink2 = new NavLink({
    			props: {
    				link: Pages.LOGIC,
    				text: "Conditional Logic"
    			},
    			$$inline: true
    		});

    	navlink3 = new NavLink({
    			props: {
    				link: Pages.CODE,
    				text: "Generate Code",
    				extraClass: "last"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			a0 = element("a");
    			create_component(logo.$$.fragment);
    			t0 = space();
    			nav = element("nav");
    			create_component(navlink0.$$.fragment);
    			t1 = space();
    			create_component(navlink1.$$.fragment);
    			t2 = space();
    			create_component(navlink2.$$.fragment);
    			t3 = space();
    			create_component(navlink3.$$.fragment);
    			t4 = space();
    			p = element("p");
    			t5 = text("A project by ");
    			a1 = element("a");
    			a1.textContent = "Alex Iglesias";
    			t7 = text(".");
    			attr_dev(a0, "href", "https://brota.me/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "logo-wrap w-inline-block");
    			add_location(a0, file$1, 7, 2, 192);
    			attr_dev(nav, "class", "nav");
    			add_location(nav, file$1, 12, 2, 326);
    			attr_dev(a1, "href", "https://webflow.com/alexiglesias");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$1, 28, 36, 815);
    			attr_dev(p, "class", "nav-about");
    			add_location(p, file$1, 28, 2, 781);
    			attr_dev(header, "class", "nav-wrap");
    			add_location(header, file$1, 5, 0, 146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, a0);
    			mount_component(logo, a0, null);
    			append_dev(header, t0);
    			append_dev(header, nav);
    			mount_component(navlink0, nav, null);
    			append_dev(nav, t1);
    			mount_component(navlink1, nav, null);
    			append_dev(nav, t2);
    			mount_component(navlink2, nav, null);
    			append_dev(nav, t3);
    			mount_component(navlink3, nav, null);
    			append_dev(header, t4);
    			append_dev(header, p);
    			append_dev(p, t5);
    			append_dev(p, a1);
    			append_dev(p, t7);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(navlink0.$$.fragment, local);
    			transition_in(navlink1.$$.fragment, local);
    			transition_in(navlink2.$$.fragment, local);
    			transition_in(navlink3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(navlink0.$$.fragment, local);
    			transition_out(navlink1.$$.fragment, local);
    			transition_out(navlink2.$$.fragment, local);
    			transition_out(navlink3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(logo);
    			destroy_component(navlink0);
    			destroy_component(navlink1);
    			destroy_component(navlink2);
    			destroy_component(navlink3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, []);
    	$$self.$capture_state = () => ({ NavLink, Logo, Pages });
    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\ui\Hero.svelte generated by Svelte v3.24.1 */
    const file$2 = "src\\ui\\Hero.svelte";

    // (20:4) {#if primaryText}
    function create_if_block_1(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*primaryText*/ ctx[2]);
    			attr_dev(button, "class", "button w-button");
    			add_location(button, file$2, 20, 6, 493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*primaryText*/ 4) set_data_dev(t, /*primaryText*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:4) {#if primaryText}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if secondaryText}
    function create_if_block(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*secondaryText*/ ctx[3]);
    			attr_dev(button, "class", "button outline w-button");
    			add_location(button, file$2, 29, 6, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*secondaryText*/ 8) set_data_dev(t, /*secondaryText*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(29:4) {#if secondaryText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let h1;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let div0;
    	let t3;
    	let if_block0 = /*primaryText*/ ctx[2] && create_if_block_1(ctx);
    	let if_block1 = /*secondaryText*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "mb-4");
    			add_location(h1, file$2, 10, 2, 303);
    			attr_dev(p, "class", "mb-8");
    			add_location(p, file$2, 13, 2, 359);
    			attr_dev(div0, "class", "hero-buttons");
    			add_location(div0, file$2, 18, 2, 436);
    			attr_dev(div1, "class", "container max-w-xl vflex-c-c center");
    			add_location(div1, file$2, 7, 0, 230);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p);
    			p.innerHTML = /*subtitle*/ ctx[1];
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*subtitle*/ 2) p.innerHTML = /*subtitle*/ ctx[1];
    			if (/*primaryText*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*secondaryText*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { title } = $$props,
    		{ subtitle } = $$props,
    		{ primaryText = undefined } = $$props,
    		{ secondaryText = undefined } = $$props;

    	// Functions
    	const dispatch = createEventDispatcher();

    	const writable_props = ["title", "subtitle", "primaryText", "secondaryText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hero", $$slots, []);

    	const click_handler = () => {
    		dispatch("primaryclick");
    	};

    	const click_handler_1 = () => {
    		dispatch("secondaryclick");
    	};

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("subtitle" in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    		if ("primaryText" in $$props) $$invalidate(2, primaryText = $$props.primaryText);
    		if ("secondaryText" in $$props) $$invalidate(3, secondaryText = $$props.secondaryText);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		title,
    		subtitle,
    		primaryText,
    		secondaryText,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("subtitle" in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    		if ("primaryText" in $$props) $$invalidate(2, primaryText = $$props.primaryText);
    		if ("secondaryText" in $$props) $$invalidate(3, secondaryText = $$props.secondaryText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		subtitle,
    		primaryText,
    		secondaryText,
    		dispatch,
    		click_handler,
    		click_handler_1
    	];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			title: 0,
    			subtitle: 1,
    			primaryText: 2,
    			secondaryText: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Hero> was created without expected prop 'title'");
    		}

    		if (/*subtitle*/ ctx[1] === undefined && !("subtitle" in props)) {
    			console.warn("<Hero> was created without expected prop 'subtitle'");
    		}
    	}

    	get title() {
    		throw new Error("<Hero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Hero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitle() {
    		throw new Error("<Hero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitle(value) {
    		throw new Error("<Hero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primaryText() {
    		throw new Error("<Hero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primaryText(value) {
    		throw new Error("<Hero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondaryText() {
    		throw new Error("<Hero>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondaryText(value) {
    		throw new Error("<Hero>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src\ui\TransitionWrap.svelte generated by Svelte v3.24.1 */
    const file$3 = "src\\ui\\TransitionWrap.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let div_class_value;
    	let div_intro;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "content-wrap " + /*extraClass*/ ctx[0]);
    			add_location(div, file$3, 5, 0, 115);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*extraClass*/ 1 && div_class_value !== (div_class_value = "content-wrap " + /*extraClass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, { duration: 250 });
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { extraClass = "" } = $$props;
    	const writable_props = ["extraClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TransitionWrap> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TransitionWrap", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("extraClass" in $$props) $$invalidate(0, extraClass = $$props.extraClass);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade, extraClass });

    	$$self.$inject_state = $$props => {
    		if ("extraClass" in $$props) $$invalidate(0, extraClass = $$props.extraClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [extraClass, $$scope, $$slots];
    }

    class TransitionWrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { extraClass: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TransitionWrap",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get extraClass() {
    		throw new Error("<TransitionWrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extraClass(value) {
    		throw new Error("<TransitionWrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Home.svelte generated by Svelte v3.24.1 */
    const file$4 = "src\\pages\\Home.svelte";

    // (10:0) <TransitionWrap extraClass="justify-center">
    function create_default_slot(ctx) {
    	let section;
    	let hero;
    	let current;

    	hero = new Hero({
    			props: {
    				title: "Webflow Advanced Forms",
    				subtitle: `Welcome to the <strong>beta</strong> version of the Advanced
      Forms Builder. Now you can add multi step functionality and conditional
      logic to your Webflow Forms!<br />Found a bug? Got a request? Let me know
      <a href="mailto:alex@brota.me?subject=Advanced%20Webflow%20Forms">alex@brota.me</a>.`,
    				primaryText: "Get Started!",
    				secondaryText: "See Demos"
    			},
    			$$inline: true
    		});

    	hero.$on("primaryclick", /*startBuilder*/ ctx[0]);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(hero.$$.fragment);
    			attr_dev(section, "class", "section");
    			add_location(section, file$4, 10, 2, 326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(hero, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(hero);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(10:0) <TransitionWrap extraClass=\\\"justify-center\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let transitionwrap;
    	let current;

    	transitionwrap = new TransitionWrap({
    			props: {
    				extraClass: "justify-center",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(transitionwrap.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(transitionwrap, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const transitionwrap_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				transitionwrap_changes.$$scope = { dirty, ctx };
    			}

    			transitionwrap.$set(transitionwrap_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transitionwrap.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transitionwrap.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transitionwrap, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $currentPage;
    	validate_store(currentPage, "currentPage");
    	component_subscribe($$self, currentPage, $$value => $$invalidate(1, $currentPage = $$value));

    	const startBuilder = () => {
    		set_store_value(currentPage, $currentPage = Pages.MSF);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);

    	$$self.$capture_state = () => ({
    		Hero,
    		TransitionWrap,
    		currentPage,
    		Pages,
    		startBuilder,
    		$currentPage
    	});

    	return [startBuilder];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    // Variables
    const required = [
        { key: 'webflowSetup', title: 'Webflow setup' },
        { key: 'elements', title: 'Elements' },
    ];
    const optional = [
        { key: 'alertSelector', title: 'Alert Element', selected: false },
        { key: 'alertText', title: 'Alert Text', selected: false },
        { key: 'backText', title: 'Back Button Text', selected: false },
        { key: 'backSelector', title: 'Back Button', selected: false },
        {
            key: 'completedPercentageSelector',
            title: 'Display Completed %',
            selected: false,
        },
        {
            key: 'currentStepSelector',
            title: 'Display Current Step',
            selected: false,
        },
        { key: 'customNav', title: 'Custom Nav Links', selected: false },
        { key: 'displayValues', title: 'Display Filled Values', selected: false },
        { key: 'hiddenForm', title: 'Extra Hidden Form', selected: false },
        { key: 'msfGlobal', title: 'Global Options', selected: false },
        { key: 'nextText', title: 'Next Button Text', selected: false },
        { key: 'warningClass', title: 'Warning Class', selected: false },
    ];
    const params = {
        hiddeButtonsOnSubmit: true,
        scrollTopOnStepChange: false,
    };
    const msfStore = writable(params);
    const msfActivated = writable(false);
    const msfRequired = writable(required);
    const optionalStore = writable(optional);
    const msfOptional = {
        subscribe: optionalStore.subscribe,
        modify: (key, selected) => {
            optionalStore.update((items) => items.map((item) => {
                if (item.key === key)
                    item.selected = selected;
                return item;
            }));
        },
        checkSelected: (key) => {
            let selected = false;
            const unsubscribe = optionalStore.subscribe((items) => {
                selected = items.find((item) => item.key === key).selected;
            });
            unsubscribe();
            return selected;
        },
    };
    // Checks if the starter form has been copied
    const msfCopy = writable(false);

    const msfSlides = {
        intro: [
            {
                title: 'Multi step Feature',
                content: `<p>Add multi step functionality to your Webflow Forms in a couple of clicks:<br></p>
      <ul role="list">
        <li>Input validation</li>
        <li>Warnings</li>
        <li>Custom Interactions</li>
        <li>And much more!</li>
      </ul>
      <p>Simply select all the features that you want to add and the builder will generate the code for you :)<br></p>
      <p>Some functionalities may require a certain setup in Webflow, always check the info before setting them!<br></p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee4654862720cad5da7d_MSF-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee4654862720cad5da7d_MSF-transcode.webm',
            },
        ],
        webflowSetup: [
            {
                title: 'Webflow setup',
                content: `<p>
      The slides will act as different steps of your form. You can put
      how many slides as you want inside the slider.<br />
    </p>
    <p>
      Each step will check the required inputs inside it before
      jumping to the next one.<br />
    </p>
    <p>
      You can put how many slides (steps) as you want inside the
      slider. Each step will check the
      <strong class="underline">required and visible</strong> inputs
      inside it before jumping to the next one.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee565486279ea8d5da9a_Webflow Setup-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee565486279ea8d5da9a_Webflow Setup-transcode.webm',
            },
        ],
        elements: [
            {
                title: 'Required elements',
                content: `<p>
      Make sure that you set the ID of the Form,
      <strong>not</strong> the Form Block.<br />
    </p>
    <p>
      The next button doesn&#x27;t need to be placed inside the form,
      it can be located anywhere in the page.<br />
    </p>
    <p>
      Once the last step is reached, the next button&#x27;s text will
      change to the submit button&#x27;s text.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Note:</strong> remember to place a submit button set to
      <span class="opacity-75">display:none</span> anywhere inside the
      form.
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee3490d139ddcd925872_Elements-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee3490d139ddcd925872_Elements-transcode.webm',
            },
        ],
        alertSelector: [
            {
                title: 'Alert element',
                content: `<p>
      You can show an element as an alert when there are missing
      fields that must be filled.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Eg:</strong> show a box that alerts the user to fill the
      missing inputs.
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>
    <p>
      By default, it will be set to
      <span class="opacity-75">display:block</span> when shown, and
      <span class="opacity-75">display:none</span> when hidden.<br />
    </p>
    <p>
      If you want to show it using a Webflow Interaction, place a
      hidden <em>Div Block</em> inside it with the custom
      attribute:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf</li>
      <li><strong>Value:</strong> alert</li>
    </ul>
    <p>
      And bind it to a
      <span class="opacity-75">Mouse click (tap)</span>
      interaction.<br />The script will trigger the
      <span class="opacity-75">1st click</span> to show it and the
      <span class="opacity-75">2nd click</span> to hide it.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43a0a2b1f46811a0ec526e_Alert%20Element-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43a0a2b1f46811a0ec526e_Alert%20Element-transcode.webm',
            },
        ],
        backSelector: [
            {
                title: 'Back button',
                content: `<p>
      Use this button to let the user go back to the previous step.<br />
    </p>
    <p>
      It is recommended that you hide it in the first slide (step) to
      avoid confusing the users.<br />
    </p>
    <p>
      To do so, use a Slider Change interaction to hide it when the
      first slide enters and show it when the first slide leaves.<br />
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee1122e26a9a3213fcfd_Back Button-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee1122e26a9a3213fcfd_Back Button-transcode.webm',
            },
        ],
        alertText: [
            {
                title: 'Alert text',
                content: `<p>
      You can show a global alert when there are missing fields that
      must be filled.<br />
    </p>
    <p>Check how it will look:<br /></p>
    <button
      type="button"
      class="button w-button"
      onclick="alert('It will look like this!')"
    >
      Display alert
    </button>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee0cdb6e8b2c895a3705_Alert Text-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee0cdb6e8b2c895a3705_Alert Text-transcode.webm',
            },
        ],
        backText: [
            {
                title: 'Back button text',
                content: `<p>
      Additionally, you can set a different text of the back button in
      any step.<br />
    </p>
    <p>
      If you don&#x27;t set the text for a particular step
      <em class="opacity-75"
        >(for example you set the text for the 2nd and 4th step, but
        not the 3rd)</em
      >
      it will fall back to the lower closest one
      <em class="opacity-75">(the 2nd one in this case)</em>.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee16ba9928d0613cfdf4_Back Text-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee16ba9928d0613cfdf4_Back Text-transcode.webm',
            },
        ],
        nextText: [
            {
                title: 'Next button text',
                content: `<p>
      Additionally, you can set a different text of the next button in
      any step.<br />
    </p>
    <p>
      If you don&#x27;t set the text for a particular step
      <em class="opacity-75"
        >(for example you set the text for the 2nd and 4th step, but
        not the 3rd)</em
      >
      it will fall back to the lower closest one
      <em class="opacity-75">(the 2nd one in this case)</em>.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee4c877e0acbbcd606ff_Next Text-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee4c877e0acbbcd606ff_Next Text-transcode.webm',
            },
        ],
        completedPercentageSelector: [
            {
                title: 'Display completed %',
                content: `<p>
      You can set any text element (paragraph, text block, heading,
      list item...) to display the completed % of the steps:<br />
    </p>
    <p>
      It will show the percentage starting from 0% in the first step
      to 100% in the last step.<br />
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee1bdb6e8bc01c5a3710_Completed Percentage-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee1bdb6e8bc01c5a3710_Completed Percentage-transcode.webm',
            },
        ],
        currentStepSelector: [
            {
                title: 'Display current step',
                content: `<p>
      You can set any text element (paragraph, text block, heading,
      list item...) to display the number of the current step.<br />
    </p>
    <p>
      If you want to show the number of total steps, you should to it
      manually as it is a fixed value.<br />
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee267778392e5f0fd1e3_Current Step-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee267778392e5f0fd1e3_Current Step-transcode.webm',
            },
        ],
        customNav: [
            {
                title: 'Custom nav links',
                content: `<p>
      You can let the user jump to a specific step adding this custom
      nav links.<br />
    </p>
    <p>
      To do so, give this custom attribute to the element that should
      trigger it when clicked:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf-nav</li>
      <li>
        <strong>Value:</strong> The number of the step (<strong
          >Eg:</strong
        >
        2)
      </li>
    </ul>
    <p>This elements can be placed anywhere in the page.<br /></p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee2ab937946f7bdb3864_Custom Nav-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee2ab937946f7bdb3864_Custom Nav-transcode.webm',
            },
        ],
        displayValues: [
            {
                title: 'Display filled values',
                content: `<p>
      You can set the value of an input to be displayed on any text
      element (paragraph, text block, heading, list item...).<br />
    </p>
    <p>
      To do so, give this custom attribute to the text element that
      should show it:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf-value</li>
      <li>
        <strong>Value:</strong> The ID of the input (<strong
          >Eg:</strong
        >
        email)
      </li>
    </ul>
    <p>This elements can be placed anywhere in the page.<br /></p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee2f3f5ea2bb18716185_Display Values-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee2f3f5ea2bb18716185_Display Values-transcode.webm',
            },
        ],
        msfGlobal: [
            {
                title: 'Global options',
                content: `<p>
      The navigation buttons (next, back, and custom navs) are
      disabled once the form is submitted.<br />
    </p>
    <p>
      You can additionally hide the back and next button by checking
      the option. They will be set to
      <span class="opacity-75">display:none</span>.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee39b937947cdfdb38e9_Global Options-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee39b937947cdfdb38e9_Global Options-transcode.webm',
            },
        ],
        warningClass: [
            {
                title: 'Warning class',
                content: `<p>
      You can add a CSS class to each missing input when the user
      tries to jump to the next step.<br />
    </p>
    <p>
      This is useful to highlight those inputs that should be filled,
      like adding a colored border.<br />
    </p>
    <p>
      Once the input is filled, that CSS class will be removed.<br />
    </p>
    <p>
      Radio inputs and checkboxes should be set to
      <strong>Custom</strong> in the Webflow Designer in order to
      display it correctly.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee51a9fec7dce69ba40c_Warning Class-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee51a9fec7dce69ba40c_Warning Class-transcode.webm',
            },
        ],
        hiddenForm: [
            {
                title: 'Extra hidden form',
                content: `<p>
      You can send an additional hidden form when the user completes a
      specific step.<br />
    </p>
    <p>
      This feature is useful if you want to make sure that some of the
      info is collected even if the user doesn&#x27;t complete the
      whole form.<br />
    </p>
    <p>
      Add this custom attribute to each input that you want to collect
      in the hidden form:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf</li>
      <li><strong>Value:</strong> hidden</li>
    </ul>
    <p>
      The script will automatically create the hidden form, populate
      and send it when the user completes the desired step.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee416621331f88cbbca5_Hidden Form-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee416621331f88cbbca5_Hidden Form-transcode.webm',
            },
        ],
    };

    /* src\ui\Select.svelte generated by Svelte v3.24.1 */

    const file$5 = "src\\ui\\Select.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (8:2) {#if label}
    function create_if_block$1(ctx) {
    	let label_1;
    	let t;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(label_1, "for", /*id*/ ctx[2]);
    			attr_dev(label_1, "class", "input-label");
    			add_location(label_1, file$5, 8, 4, 217);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);

    			if (dirty & /*id*/ 4) {
    				attr_dev(label_1, "for", /*id*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(8:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#each options as option (option.value)}
    function create_each_block(key_1, ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[8].name + "";
    	let t0;
    	let t1;
    	let option_value_value;
    	let option_disabled_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*option*/ ctx[8].value;
    			option.value = option.__value;
    			option.disabled = option_disabled_value = /*option*/ ctx[8].disabled;
    			add_location(option, file$5, 14, 6, 425);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 16 && t0_value !== (t0_value = /*option*/ ctx[8].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*options*/ 16 && option_value_value !== (option_value_value = /*option*/ ctx[8].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty & /*options*/ 16 && option_disabled_value !== (option_disabled_value = /*option*/ ctx[8].disabled)) {
    				prop_dev(option, "disabled", option_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:4) {#each options as option (option.value)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let t;
    	let select;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*label*/ ctx[1] && create_if_block$1(ctx);
    	let each_value = /*options*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*option*/ ctx[8].value;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "id", /*id*/ ctx[2]);
    			attr_dev(select, "name", /*name*/ ctx[3]);
    			attr_dev(select, "class", "input-field w-select");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[7].call(select));
    			add_location(select, file$5, 12, 2, 302);
    			attr_dev(div, "class", div_class_value = "relative " + /*extraClass*/ ctx[5]);
    			add_location(div, file$5, 5, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[7]),
    					listen_dev(select, "input", /*input_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*options*/ 16) {
    				const each_value = /*options*/ ctx[4];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block, null, get_each_context);
    			}

    			if (dirty & /*id*/ 4) {
    				attr_dev(select, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(select, "name", /*name*/ ctx[3]);
    			}

    			if (dirty & /*value, options*/ 17) {
    				select_option(select, /*value*/ ctx[0]);
    			}

    			if (dirty & /*extraClass*/ 32 && div_class_value !== (div_class_value = "relative " + /*extraClass*/ ctx[5])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	

    	let { label = undefined } = $$props,
    		{ id } = $$props,
    		{ name } = $$props,
    		{ options } = $$props,
    		{ value = options[0].value } = $$props,
    		{ extraClass } = $$props;

    	const writable_props = ["label", "id", "name", "options", "value", "extraClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Select", $$slots, []);

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(4, options);
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("extraClass" in $$props) $$invalidate(5, extraClass = $$props.extraClass);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		id,
    		name,
    		options,
    		value,
    		extraClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(1, label = $$props.label);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("extraClass" in $$props) $$invalidate(5, extraClass = $$props.extraClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		label,
    		id,
    		name,
    		options,
    		extraClass,
    		input_handler,
    		select_change_handler
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			label: 1,
    			id: 2,
    			name: 3,
    			options: 4,
    			value: 0,
    			extraClass: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<Select> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[3] === undefined && !("name" in props)) {
    			console.warn("<Select> was created without expected prop 'name'");
    		}

    		if (/*options*/ ctx[4] === undefined && !("options" in props)) {
    			console.warn("<Select> was created without expected prop 'options'");
    		}

    		if (/*extraClass*/ ctx[5] === undefined && !("extraClass" in props)) {
    			console.warn("<Select> was created without expected prop 'extraClass'");
    		}
    	}

    	get label() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extraClass() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extraClass(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Input.svelte generated by Svelte v3.24.1 */
    const file$6 = "src\\ui\\Input.svelte";

    // (39:2) {#if label}
    function create_if_block$2(ctx) {
    	let label_1;
    	let t;
    	let if_block = /*required*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t = text(/*label*/ ctx[0]);
    			if (if_block) if_block.c();
    			attr_dev(label_1, "for", /*id*/ ctx[3]);
    			attr_dev(label_1, "class", "input-label");
    			add_location(label_1, file$6, 40, 4, 1168);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t);
    			if (if_block) if_block.m(label_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);

    			if (/*required*/ ctx[1]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(label_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(label_1, "for", /*id*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(39:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (41:47) {#if required}
    function create_if_block_1$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "*";
    			attr_dev(span, "class", "sea-green");
    			add_location(span, file$6, 40, 61, 1225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(41:47) {#if required}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t;
    	let input_1;
    	let div_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*label*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			input_1 = element("input");
    			attr_dev(input_1, "type", /*type*/ ctx[2]);
    			attr_dev(input_1, "name", /*name*/ ctx[4]);
    			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[5]);
    			attr_dev(input_1, "id", /*id*/ ctx[3]);
    			attr_dev(input_1, "min", /*min*/ ctx[7]);
    			attr_dev(input_1, "max", /*max*/ ctx[8]);
    			input_1.value = /*inputValue*/ ctx[10];
    			attr_dev(input_1, "class", "input-field w-input");
    			attr_dev(input_1, "maxlength", "256");
    			add_location(input_1, file$6, 42, 2, 1283);
    			attr_dev(div, "class", div_class_value = "relative " + /*extraClass*/ ctx[6]);
    			add_location(div, file$6, 36, 0, 1055);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, input_1);
    			/*input_1_binding*/ ctx[15](input_1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "input", /*input_handler*/ ctx[14], false, false, false),
    					listen_dev(input_1, "input", /*handleInput*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*type*/ 4) {
    				attr_dev(input_1, "type", /*type*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(input_1, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*placeholder*/ 32) {
    				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[5]);
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(input_1, "id", /*id*/ ctx[3]);
    			}

    			if (dirty & /*min*/ 128) {
    				attr_dev(input_1, "min", /*min*/ ctx[7]);
    			}

    			if (dirty & /*max*/ 256) {
    				attr_dev(input_1, "max", /*max*/ ctx[8]);
    			}

    			if (dirty & /*inputValue*/ 1024 && input_1.value !== /*inputValue*/ ctx[10]) {
    				prop_dev(input_1, "value", /*inputValue*/ ctx[10]);
    			}

    			if (dirty & /*extraClass*/ 64 && div_class_value !== (div_class_value = "relative " + /*extraClass*/ ctx[6])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*input_1_binding*/ ctx[15](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { label = undefined } = $$props,
    		{ required = false } = $$props,
    		{ type = "text" } = $$props,
    		{ id } = $$props,
    		{ name } = $$props,
    		{ value = "" } = $$props,
    		{ placeholder } = $$props,
    		{ extraClass = "" } = $$props,
    		{ min = undefined } = $$props,
    		{ max = undefined } = $$props,
    		{ selector = undefined } = $$props;

    	// Variables
    	let input;

    	let inputValue = "";

    	// Functions
    	// Add id or class selector if needed
    	function addSelector(value) {
    		if (!selector) return value;
    		if (selector === "id") return `#${value}`;
    		if (selector === "class") return `.${value}`;
    	}

    	// Remove the selector from the value
    	function removeSelector(value) {
    		if (!selector) return value;
    		const strings = { id: "#", class: "." };
    		const reg = new RegExp(strings[selector]);
    		return value.replace(reg, "");
    	}

    	// Handle Input, add the selector only if input has value
    	function handleInput() {
    		$$invalidate(12, value = input.value.length > 0 ? addSelector(input.value) : "");
    	}

    	const writable_props = [
    		"label",
    		"required",
    		"type",
    		"id",
    		"name",
    		"value",
    		"placeholder",
    		"extraClass",
    		"min",
    		"max",
    		"selector"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, []);

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(9, input);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ("extraClass" in $$props) $$invalidate(6, extraClass = $$props.extraClass);
    		if ("min" in $$props) $$invalidate(7, min = $$props.min);
    		if ("max" in $$props) $$invalidate(8, max = $$props.max);
    		if ("selector" in $$props) $$invalidate(13, selector = $$props.selector);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		label,
    		required,
    		type,
    		id,
    		name,
    		value,
    		placeholder,
    		extraClass,
    		min,
    		max,
    		selector,
    		input,
    		inputValue,
    		addSelector,
    		removeSelector,
    		handleInput
    	});

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ("extraClass" in $$props) $$invalidate(6, extraClass = $$props.extraClass);
    		if ("min" in $$props) $$invalidate(7, min = $$props.min);
    		if ("max" in $$props) $$invalidate(8, max = $$props.max);
    		if ("selector" in $$props) $$invalidate(13, selector = $$props.selector);
    		if ("input" in $$props) $$invalidate(9, input = $$props.input);
    		if ("inputValue" in $$props) $$invalidate(10, inputValue = $$props.inputValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 4096) {
    			// Reactive
    			 if (value) $$invalidate(10, inputValue = removeSelector(value.toString()));
    		}
    	};

    	return [
    		label,
    		required,
    		type,
    		id,
    		name,
    		placeholder,
    		extraClass,
    		min,
    		max,
    		input,
    		inputValue,
    		handleInput,
    		value,
    		selector,
    		input_handler,
    		input_1_binding
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			label: 0,
    			required: 1,
    			type: 2,
    			id: 3,
    			name: 4,
    			value: 12,
    			placeholder: 5,
    			extraClass: 6,
    			min: 7,
    			max: 8,
    			selector: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
    			console.warn("<Input> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[4] === undefined && !("name" in props)) {
    			console.warn("<Input> was created without expected prop 'name'");
    		}

    		if (/*placeholder*/ ctx[5] === undefined && !("placeholder" in props)) {
    			console.warn("<Input> was created without expected prop 'placeholder'");
    		}
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extraClass() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extraClass(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selector() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selector(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\AlertElement.svelte generated by Svelte v3.24.1 */
    const file$7 = "src\\pages\\msf\\components\\AlertElement.svelte";

    function create_fragment$c(ctx) {
    	let p;
    	let t1;
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		label: "Element ID",
    		id: "alert-id",
    		name: "Alert ID",
    		placeholder: "Eg: alert-element",
    		selector: "id"
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Check the info to learn how to show / hide it using Webflow interactions.";
    			t1 = space();
    			create_component(input.$$.fragment);
    			attr_dev(p, "class", "mb-8");
    			add_location(p, file$7, 23, 0, 562);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(3, $msfStore = $$value));
    	let { key } = $$props;

    	// Variables
    	let value = $msfStore[key] || "";

    	// Functions
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AlertElement> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AlertElement", $$slots, []);

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		msfStore,
    		msfOptional,
    		Select,
    		Input,
    		key,
    		value,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, key*/ 3) {
    			// Reactive
    			 if (value.length > 0) set_store_value(msfStore, $msfStore[key] = value, $msfStore); else deleteParams();
    		}
    	};

    	return [value, key, input_value_binding];
    }

    class AlertElement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AlertElement",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<AlertElement> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<AlertElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<AlertElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\AlertText.svelte generated by Svelte v3.24.1 */

    function create_fragment$d(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		label: "Alert Text",
    		id: "alert-text",
    		name: "Alert Text",
    		placeholder: "Eg: Please, fill all the inputs."
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(3, $msfStore = $$value));
    	let { key } = $$props;

    	// Variables
    	let value = $msfStore[key] || "";

    	// Functions
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AlertText> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AlertText", $$slots, []);

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Input,
    		msfStore,
    		msfOptional,
    		key,
    		value,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, key*/ 3) {
    			// Reactive
    			 if (value.length > 0) set_store_value(msfStore, $msfStore[key] = value, $msfStore); else deleteParams();
    		}
    	};

    	return [value, key, input_value_binding];
    }

    class AlertText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AlertText",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<AlertText> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<AlertText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<AlertText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\BackButton.svelte generated by Svelte v3.24.1 */

    function create_fragment$e(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		label: "Back Button ID:",
    		id: "back-button",
    		name: "Back Button",
    		placeholder: "Eg: back-id",
    		selector: "id"
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(3, $msfStore = $$value));
    	let { key } = $$props;

    	// Variables
    	let value = $msfStore[key] || "";

    	// Functions
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) {
    			deleteParams();

    			// If back text is active, deactivate it
    			if (msfOptional.checkSelected("backText")) msfOptional.modify("backText", false);
    		}
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BackButton", $$slots, []);

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Input,
    		msfStore,
    		msfOptional,
    		key,
    		value,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, key*/ 3) {
    			// Reactive
    			 if (value.length > 0) set_store_value(msfStore, $msfStore[key] = value, $msfStore); else deleteParams();
    		}
    	};

    	return [value, key, input_value_binding];
    }

    class BackButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackButton",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<BackButton> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<BackButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<BackButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    var getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);
    var rnds8 = new Uint8Array(16);
    function rng() {
      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    /* src\icons\plus-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$f(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 448 448" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M416 176H272V32C272 14.33 257.67 0 240 0H208C190.33 0 176 14.33\r\n    176 32V176H32C14.33 176 0 190.33 0 208V240C0 257.67 14.33 272 32\r\n    272H176V416C176 433.67 190.33 448 208 448H240C257.67 448 272\r\n    433.67 272 416V272H416C433.67 272 448 257.67 448 240V208C448\r\n    190.33 433.67 176 416 176Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 448 448" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class PlusIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});
    	}
    }

    /* src\icons\minus-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$g(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 448 96" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M416 0H32C14.33 0 0 14.33 0 32V64C0 81.67 14.33 96 32\r\n    96H416C433.67 96 448 81.67 448 64V32C448 14.33 433.67 0 416 0Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 448 96" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MinusIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});
    	}
    }

    /* src\icons\copy-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$h(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 448 512" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M433.941 65.941L382.059 14.059C373.057 5.05724 360.848 6.65676e-05\r\n    348.118 0L176 0C149.49 0 128 21.49 128 48V96H48C21.49 96 0 117.49 0\r\n    144V464C0 490.51 21.49 512 48 512H272C298.51 512 320 490.51 320\r\n    464V416H400C426.51 416 448 394.51 448 368V99.882C448 87.1516 442.943\r\n    74.9427 433.941 65.941ZM266 464H54C52.4087 464 50.8826 463.368 49.7574\r\n    462.243C48.6321 461.117 48 459.591 48 458V150C48 148.409 48.6321\r\n    146.883 49.7574 145.757C50.8826 144.632 52.4087 144 54 144H128V368C128\r\n    394.51 149.49 416 176 416H272V458C272 459.591 271.368 461.117 270.243\r\n    462.243C269.117 463.368 267.591 464 266 464ZM394 368H182C180.409 368\r\n    178.883 367.368 177.757 366.243C176.632 365.117 176 363.591 176\r\n    362V54C176 52.4087 176.632 50.8826 177.757 49.7574C178.883 48.6321\r\n    180.409 48 182 48H288V136C288 149.255 298.745 160 312 160H400V362C400\r\n    363.591 399.368 365.117 398.243 366.243C397.117 367.368 395.591 368\r\n    394 368V368ZM400 112H336V48H345.632C347.223 48 348.749 48.632 349.875\r\n    49.757L398.243 98.125C398.8 98.6822 399.242 99.3437 399.544\r\n    100.072C399.845 100.8 400 101.58 400 102.368V112Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 448 512" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class CopyIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});
    	}
    }

    /* src\ui\ControlButton.svelte generated by Svelte v3.24.1 */
    const file$8 = "src\\ui\\ControlButton.svelte";

    // (20:2) {:else}
    function create_else_block(ctx) {
    	let copyicon;
    	let current;

    	copyicon = new CopyIcon({
    			props: { class: "small-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(copyicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(copyicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(copyicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(copyicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(copyicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(20:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:32) 
    function create_if_block_1$2(ctx) {
    	let removeicon;
    	let current;

    	removeicon = new MinusIcon({
    			props: { class: "small-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(removeicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(removeicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(removeicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(removeicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(removeicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(18:32) ",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#if action === 'add'}
    function create_if_block$3(ctx) {
    	let addicon;
    	let current;

    	addicon = new PlusIcon({
    			props: { class: "small-icon" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(addicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(16:2) {#if action === 'add'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let button_1;
    	let current_block_type_index;
    	let if_block;
    	let button_1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_if_block_1$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*action*/ ctx[1] === "add") return 0;
    		if (/*action*/ ctx[1] === "delete") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			if_block.c();
    			attr_dev(button_1, "type", "button");
    			attr_dev(button_1, "class", button_1_class_value = "control-button " + /*action*/ ctx[1] + "\r\n  " + /*extraClass*/ ctx[2]);
    			add_location(button_1, file$8, 9, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			if_blocks[current_block_type_index].m(button_1, null);
    			/*button_1_binding*/ ctx[4](button_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button_1, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(button_1, null);
    			}

    			if (!current || dirty & /*action, extraClass*/ 6 && button_1_class_value !== (button_1_class_value = "control-button " + /*action*/ ctx[1] + "\r\n  " + /*extraClass*/ ctx[2])) {
    				attr_dev(button_1, "class", button_1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if_blocks[current_block_type_index].d();
    			/*button_1_binding*/ ctx[4](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { action = "add" } = $$props, { extraClass = "" } = $$props;
    	let { button = null } = $$props;
    	const writable_props = ["action", "extraClass", "button"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ControlButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ControlButton", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			button = $$value;
    			$$invalidate(0, button);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("action" in $$props) $$invalidate(1, action = $$props.action);
    		if ("extraClass" in $$props) $$invalidate(2, extraClass = $$props.extraClass);
    		if ("button" in $$props) $$invalidate(0, button = $$props.button);
    	};

    	$$self.$capture_state = () => ({
    		action,
    		extraClass,
    		button,
    		AddIcon: PlusIcon,
    		RemoveIcon: MinusIcon,
    		CopyIcon
    	});

    	$$self.$inject_state = $$props => {
    		if ("action" in $$props) $$invalidate(1, action = $$props.action);
    		if ("extraClass" in $$props) $$invalidate(2, extraClass = $$props.extraClass);
    		if ("button" in $$props) $$invalidate(0, button = $$props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [button, action, extraClass, click_handler, button_1_binding];
    }

    class ControlButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { action: 1, extraClass: 2, button: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlButton",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get action() {
    		throw new Error("<ControlButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<ControlButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extraClass() {
    		throw new Error("<ControlButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extraClass(value) {
    		throw new Error("<ControlButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<ControlButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<ControlButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\BackText.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1 } = globals;
    const file$9 = "src\\pages\\msf\\components\\BackText.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (52:0) {#each params as param, index (param.id)}
    function create_each_block$1(key_2, ctx) {
    	let div;
    	let input0;
    	let updating_value;
    	let t0;
    	let input1;
    	let updating_value_1;
    	let t1;
    	let controlbutton;
    	let t2;
    	let div_class_value;
    	let div_transition;
    	let current;

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[4].call(null, value, /*index*/ ctx[11]);
    	}

    	let input0_props = {
    		label: "Step",
    		type: "number",
    		id: "back-text-step-" + /*index*/ ctx[11],
    		name: "Back Text Step " + /*index*/ ctx[11],
    		placeholder: "1",
    		min: "1",
    		extraClass: "_w-1-4"
    	};

    	if (/*params*/ ctx[0][/*index*/ ctx[11]].step !== void 0) {
    		input0_props.value = /*params*/ ctx[0][/*index*/ ctx[11]].step;
    	}

    	input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding));

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[5].call(null, value, /*index*/ ctx[11]);
    	}

    	let input1_props = {
    		label: "Text",
    		id: "back-text-" + /*index*/ ctx[11],
    		name: "Back Text " + /*index*/ ctx[11],
    		placeholder: "Eg: Back Step",
    		extraClass: "flex-auto mx-2"
    	};

    	if (/*params*/ ctx[0][/*index*/ ctx[11]].text !== void 0) {
    		input1_props.value = /*params*/ ctx[0][/*index*/ ctx[11]].text;
    	}

    	input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*index*/ ctx[11], ...args);
    	}

    	controlbutton = new ControlButton({
    			props: {
    				action: /*index*/ ctx[11] === 0 ? "add" : "delete"
    			},
    			$$inline: true
    		});

    	controlbutton.$on("click", click_handler);

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(input0.$$.fragment);
    			t0 = space();
    			create_component(input1.$$.fragment);
    			t1 = space();
    			create_component(controlbutton.$$.fragment);
    			t2 = space();

    			attr_dev(div, "class", div_class_value = "hflex-c-sb no-wrap " + (/*index*/ ctx[11] < /*params*/ ctx[0].length - 1
    			? "mb-8"
    			: ""));

    			add_location(div, file$9, 52, 2, 1639);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(input0, div, null);
    			append_dev(div, t0);
    			mount_component(input1, div, null);
    			append_dev(div, t1);
    			mount_component(controlbutton, div, null);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const input0_changes = {};
    			if (dirty & /*params*/ 1) input0_changes.id = "back-text-step-" + /*index*/ ctx[11];
    			if (dirty & /*params*/ 1) input0_changes.name = "Back Text Step " + /*index*/ ctx[11];

    			if (!updating_value && dirty & /*params*/ 1) {
    				updating_value = true;
    				input0_changes.value = /*params*/ ctx[0][/*index*/ ctx[11]].step;
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};
    			if (dirty & /*params*/ 1) input1_changes.id = "back-text-" + /*index*/ ctx[11];
    			if (dirty & /*params*/ 1) input1_changes.name = "Back Text " + /*index*/ ctx[11];

    			if (!updating_value_1 && dirty & /*params*/ 1) {
    				updating_value_1 = true;
    				input1_changes.value = /*params*/ ctx[0][/*index*/ ctx[11]].text;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    			const controlbutton_changes = {};
    			if (dirty & /*params*/ 1) controlbutton_changes.action = /*index*/ ctx[11] === 0 ? "add" : "delete";
    			controlbutton.$set(controlbutton_changes);

    			if (!current || dirty & /*params*/ 1 && div_class_value !== (div_class_value = "hflex-c-sb no-wrap " + (/*index*/ ctx[11] < /*params*/ ctx[0].length - 1
    			? "mb-8"
    			: ""))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(controlbutton.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(controlbutton.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(input0);
    			destroy_component(input1);
    			destroy_component(controlbutton);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(52:0) {#each params as param, index (param.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*params*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*param*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*params, addButtonText, removeButtonText*/ 7) {
    				const each_value = /*params*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkFilled(params) {
    	const filledParams = [];

    	params.forEach(param => {
    		const { step, text } = param;
    		if (step && text) filledParams.push({ step, text });
    	});

    	return filledParams;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(7, $msfStore = $$value));
    	
    	let { key } = $$props;

    	// Variables
    	// Check if there is data already stored and it has at least one item
    	let params = $msfStore[key] && $msfStore[key].length > 0
    	? $msfStore[key].map(param => Object.assign({ id: v4() }, param))
    	: [{ id: v4() }];

    	// Add new button text
    	function addButtonText() {
    		$$invalidate(0, params = [...params, { id: v4() }]);
    	}

    	// Remove button text
    	function removeButtonText(targetIndex) {
    		$$invalidate(0, params = params.filter((param, index) => index !== targetIndex));
    	}

    	// Delete params
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	// Remove from store if unselected
    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	onMount(() => {
    		// If back button is not active, activate it
    		if (!msfOptional.checkSelected("backSelector")) msfOptional.modify("backSelector", true);
    	});

    	const writable_props = ["key"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackText> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BackText", $$slots, []);

    	function input0_value_binding(value, index) {
    		params[index].step = value;
    		$$invalidate(0, params);
    	}

    	function input1_value_binding(value, index) {
    		params[index].text = value;
    		$$invalidate(0, params);
    	}

    	const click_handler = index => {
    		if (index === 0) addButtonText(); else removeButtonText(index);
    	};

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		uuidv4: v4,
    		onMount,
    		onDestroy,
    		slide,
    		Input,
    		ControlButton,
    		msfStore,
    		msfOptional,
    		key,
    		params,
    		checkFilled,
    		addButtonText,
    		removeButtonText,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*key, params*/ 9) {
    			// Reactive
    			 set_store_value(msfStore, $msfStore[key] = checkFilled(params), $msfStore);
    		}
    	};

    	return [
    		params,
    		addButtonText,
    		removeButtonText,
    		key,
    		input0_value_binding,
    		input1_value_binding,
    		click_handler
    	];
    }

    class BackText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { key: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackText",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[3] === undefined && !("key" in props)) {
    			console.warn("<BackText> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<BackText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<BackText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\CustomNav.svelte generated by Svelte v3.24.1 */

    const file$a = "src\\pages\\msf\\components\\CustomNav.svelte";

    function create_fragment$k(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("Check the info to learn how to add this functionality in Webflow.");
    			attr_dev(p, "class", "mb-0");
    			attr_dev(p, "id", /*key*/ ctx[0]);
    			add_location(p, file$a, 4, 0, 60);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*key*/ 1) {
    				attr_dev(p, "id", /*key*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { key } = $$props;
    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CustomNav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CustomNav", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({ key });

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [key];
    }

    class CustomNav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { key: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomNav",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<CustomNav> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<CustomNav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<CustomNav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\DisplayCompleted.svelte generated by Svelte v3.24.1 */

    function create_fragment$l(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		label: "Text Element ID",
    		id: "completed-percentage",
    		name: "Completed Percentage",
    		placeholder: "Eg: completed",
    		selector: "id"
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(3, $msfStore = $$value));
    	let { key } = $$props;

    	// Variables
    	let value = $msfStore[key] || "";

    	// Functions
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayCompleted> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DisplayCompleted", $$slots, []);

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Input,
    		msfStore,
    		msfOptional,
    		key,
    		value,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, key*/ 3) {
    			// Reactive
    			 if (value.length > 0) set_store_value(msfStore, $msfStore[key] = value, $msfStore); else deleteParams();
    		}
    	};

    	return [value, key, input_value_binding];
    }

    class DisplayCompleted extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayCompleted",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<DisplayCompleted> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<DisplayCompleted>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<DisplayCompleted>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\DisplayCurrentStep.svelte generated by Svelte v3.24.1 */

    function create_fragment$m(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		label: "Text Element ID",
    		id: "current-step",
    		name: "Current Step",
    		placeholder: "Eg: current-step",
    		selector: "id"
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(3, $msfStore = $$value));
    	let { key } = $$props;

    	// Variables
    	let value = $msfStore[key] || "";

    	// Functions
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayCurrentStep> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DisplayCurrentStep", $$slots, []);

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Input,
    		msfStore,
    		msfOptional,
    		key,
    		value,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, key*/ 3) {
    			// Reactive
    			 if (value.length > 0) set_store_value(msfStore, $msfStore[key] = value, $msfStore); else deleteParams();
    		}
    	};

    	return [value, key, input_value_binding];
    }

    class DisplayCurrentStep extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayCurrentStep",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<DisplayCurrentStep> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<DisplayCurrentStep>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<DisplayCurrentStep>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\DisplayValues.svelte generated by Svelte v3.24.1 */

    const file$b = "src\\pages\\msf\\components\\DisplayValues.svelte";

    function create_fragment$n(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("Check the info to learn how to add this functionality in Webflow.");
    			attr_dev(p, "class", "mb-0");
    			attr_dev(p, "id", /*key*/ ctx[0]);
    			add_location(p, file$b, 4, 0, 60);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*key*/ 1) {
    				attr_dev(p, "id", /*key*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { key } = $$props;
    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayValues> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DisplayValues", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({ key });

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(0, key = $$props.key);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [key];
    }

    class DisplayValues extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { key: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayValues",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[0] === undefined && !("key" in props)) {
    			console.warn("<DisplayValues> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<DisplayValues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<DisplayValues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\Elements.svelte generated by Svelte v3.24.1 */

    function create_fragment$o(ctx) {
    	let input0;
    	let updating_value;
    	let t;
    	let input1;
    	let updating_value_1;
    	let current;

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[2].call(null, value);
    	}

    	let input0_props = {
    		label: "Form ID",
    		required: true,
    		id: "form",
    		name: "Form",
    		placeholder: "Eg: form-id",
    		extraClass: "mb-8",
    		selector: "id"
    	};

    	if (/*form*/ ctx[0] !== void 0) {
    		input0_props.value = /*form*/ ctx[0];
    	}

    	input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding));

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[3].call(null, value);
    	}

    	let input1_props = {
    		label: "Next Button ID",
    		required: true,
    		id: "next-button",
    		name: "Next Button",
    		placeholder: "Eg: next-id",
    		selector: "id"
    	};

    	if (/*next*/ ctx[1] !== void 0) {
    		input1_props.value = /*next*/ ctx[1];
    	}

    	input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input0.$$.fragment);
    			t = space();
    			create_component(input1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(input1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input0_changes = {};

    			if (!updating_value && dirty & /*form*/ 1) {
    				updating_value = true;
    				input0_changes.value = /*form*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};

    			if (!updating_value_1 && dirty & /*next*/ 2) {
    				updating_value_1 = true;
    				input1_changes.value = /*next*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(input1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $msfStore;
    	let $msfActivated;
    	let $msfCopy;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(4, $msfStore = $$value));
    	validate_store(msfActivated, "msfActivated");
    	component_subscribe($$self, msfActivated, $$value => $$invalidate(5, $msfActivated = $$value));
    	validate_store(msfCopy, "msfCopy");
    	component_subscribe($$self, msfCopy, $$value => $$invalidate(6, $msfCopy = $$value));
    	let form = $msfStore.formSelector || "", next = $msfStore.nextSelector || "";

    	// Functions
    	function deleteParams() {
    		delete $msfStore.formSelector;
    		delete $msfStore.nextSelector;
    	}

    	function setDefaults() {
    		$$invalidate(0, form = "#msf");
    		$$invalidate(1, next = "#msf-next");
    		set_store_value(msfCopy, $msfCopy = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Elements> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Elements", $$slots, []);

    	function input0_value_binding(value) {
    		form = value;
    		$$invalidate(0, form);
    	}

    	function input1_value_binding(value) {
    		next = value;
    		$$invalidate(1, next);
    	}

    	$$self.$capture_state = () => ({
    		Input,
    		msfStore,
    		msfActivated,
    		msfCopy,
    		form,
    		next,
    		deleteParams,
    		setDefaults,
    		$msfStore,
    		$msfActivated,
    		$msfCopy
    	});

    	$$self.$inject_state = $$props => {
    		if ("form" in $$props) $$invalidate(0, form = $$props.form);
    		if ("next" in $$props) $$invalidate(1, next = $$props.next);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$msfActivated*/ 32) {
    			// Reactive
    			 if (!$msfActivated) deleteParams();
    		}

    		if ($$self.$$.dirty & /*$msfCopy*/ 64) {
    			 if ($msfCopy) setDefaults();
    		}

    		if ($$self.$$.dirty & /*form, $msfStore*/ 17) {
    			 if (form.length > 0) set_store_value(msfStore, $msfStore.formSelector = form, $msfStore); else delete $msfStore.formSelector;
    		}

    		if ($$self.$$.dirty & /*next, $msfStore*/ 18) {
    			 if (next.length > 0) set_store_value(msfStore, $msfStore.nextSelector = next, $msfStore); else delete $msfStore.nextSelector;
    		}
    	};

    	return [form, next, input0_value_binding, input1_value_binding];
    }

    class Elements extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Elements",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src\pages\msf\components\HiddenForm.svelte generated by Svelte v3.24.1 */
    const file$c = "src\\pages\\msf\\components\\HiddenForm.svelte";

    function create_fragment$p(ctx) {
    	let p;
    	let t1;
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		type: "number",
    		label: "Step Goal",
    		id: "hidden-form-step",
    		name: "Hidden Form Step",
    		placeholder: "Send after step X. Default: 1",
    		min: "1"
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Check the info to learn how to add this functionality in Webflow.";
    			t1 = space();
    			create_component(input.$$.fragment);
    			attr_dev(p, "class", "mb-8");
    			add_location(p, file$c, 20, 0, 591);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(3, $msfStore = $$value));
    	let { key } = $$props;

    	// Variables
    	let value = $msfStore.hiddenFormStep || "";

    	function deleteParams() {
    		delete $msfStore.sendHiddenForm;
    		delete $msfStore.hiddenFormStep;
    	}

    	onMount(() => set_store_value(msfStore, $msfStore.sendHiddenForm = true, $msfStore));

    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HiddenForm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HiddenForm", $$slots, []);

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		Input,
    		msfStore,
    		msfOptional,
    		key,
    		value,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			// Reactive
    			 set_store_value(msfStore, $msfStore.hiddenFormStep = +value > 0 ? +value : 1, $msfStore);
    		}
    	};

    	return [value, key, input_value_binding];
    }

    class HiddenForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HiddenForm",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<HiddenForm> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<HiddenForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<HiddenForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\icons\info-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$q(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 496 496" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewBox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M496 248C496 384.997 384.957 496 248 496C111.043 496 0 384.997 0 248C0 111.083 111.043 0 248 0C384.957 0 496 111.083 496 248ZM254.655 82C200.158 82 165.4 104.957 138.106 145.758C134.57 151.044 135.753 158.173 140.821 162.016L175.52 188.326C180.725 192.273 188.141 191.334 192.185 186.204C210.049 163.546 222.298 150.407 249.488 150.407C269.917 150.407 295.186 163.555 295.186 183.365C295.186 198.341 282.823 206.032 262.652 217.341C239.128 230.528 208 246.941 208 288V292C208 298.627 213.373 304 220 304H276C282.627 304 288 298.627 288 292V290.667C288 262.205 371.186 261.02 371.186 184C371.186 125.998 311.021 82 254.655 82V82ZM248 330C222.635 330 202 350.635 202 376C202 401.364 222.635 422 248 422C273.365 422 294 401.364 294 376C294 350.635 273.365 330 248 330Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 496 496" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$q($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class InfoIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});
    	}
    }

    /* src\icons\delete-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$r(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 496 496" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewBox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M248 0C111 0 0 111 0 248C0 385 111 496 248 496C385 496 496 385 496 248C496 111 385 0 248 0ZM116 288C109.4 288 104 282.6 104 276V220C104 213.4 109.4 208 116 208H380C386.6 208 392 213.4 392 220V276C392 282.6 386.6 288 380 288H116Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 496 496" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$r($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class DeleteIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});
    	}
    }

    /* src\ui\MiniButton.svelte generated by Svelte v3.24.1 */
    const file$d = "src\\ui\\MiniButton.svelte";

    // (15:4) {:else}
    function create_else_block$1(ctx) {
    	let deleteicon;
    	let current;
    	deleteicon = new DeleteIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(deleteicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(deleteicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(deleteicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(deleteicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(deleteicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(15:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if action === 'info'}
    function create_if_block$4(ctx) {
    	let infoicon;
    	let current;
    	infoicon = new InfoIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(infoicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(infoicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(infoicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(infoicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(infoicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(13:4) {#if action === 'info'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let button;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*action*/ ctx[0] === "info") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", div_class_value = "mini-button " + /*action*/ ctx[0]);
    			add_location(div, file$d, 11, 2, 395);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", /*extraClass*/ ctx[1]);
    			add_location(button, file$d, 10, 0, 316);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*action*/ 1 && div_class_value !== (div_class_value = "mini-button " + /*action*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*extraClass*/ 2) {
    				attr_dev(button, "class", /*extraClass*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { action = "info" } = $$props, { extraClass = "" } = $$props;

    	// Functions
    	const dispatch = createEventDispatcher();

    	const writable_props = ["action", "extraClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MiniButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MiniButton", $$slots, []);
    	const click_handler = () => dispatch(action);

    	$$self.$$set = $$props => {
    		if ("action" in $$props) $$invalidate(0, action = $$props.action);
    		if ("extraClass" in $$props) $$invalidate(1, extraClass = $$props.extraClass);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		action,
    		extraClass,
    		InfoIcon,
    		DeleteIcon,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("action" in $$props) $$invalidate(0, action = $$props.action);
    		if ("extraClass" in $$props) $$invalidate(1, extraClass = $$props.extraClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [action, extraClass, dispatch, click_handler];
    }

    class MiniButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { action: 0, extraClass: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniButton",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get action() {
    		throw new Error("<MiniButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<MiniButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extraClass() {
    		throw new Error("<MiniButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extraClass(value) {
    		throw new Error("<MiniButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\MsfBlock.svelte generated by Svelte v3.24.1 */
    const file$e = "src\\pages\\msf\\components\\MsfBlock.svelte";

    // (10:26) {#if required}
    function create_if_block_1$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "*";
    			attr_dev(span, "class", "sea-green");
    			add_location(span, file$e, 9, 40, 271);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(10:26) {#if required}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if !required}
    function create_if_block$5(ctx) {
    	let minibutton;
    	let current;

    	minibutton = new MiniButton({
    			props: { action: "delete", extraClass: "ml-4" },
    			$$inline: true
    		});

    	minibutton.$on("delete", /*delete_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(minibutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(minibutton, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minibutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minibutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(minibutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(18:4) {#if !required}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div1;
    	let h3;
    	let t0;
    	let span;
    	let t1;
    	let div0;
    	let minibutton;
    	let t2;
    	let t3;
    	let current;
    	let if_block0 = /*required*/ ctx[1] && create_if_block_1$3(ctx);
    	minibutton = new MiniButton({ $$inline: true });
    	minibutton.$on("info", /*info_handler*/ ctx[4]);
    	let if_block1 = !/*required*/ ctx[1] && create_if_block$5(ctx);
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			if (if_block0) if_block0.c();
    			span = element("span");
    			t1 = space();
    			div0 = element("div");
    			create_component(minibutton.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "sea-green");
    			add_location(span, file$e, 9, 77, 308);
    			attr_dev(h3, "class", "mb-0");
    			add_location(h3, file$e, 9, 2, 233);
    			attr_dev(div0, "class", "hflex-c-s");
    			add_location(div0, file$e, 12, 2, 365);
    			attr_dev(div1, "class", "hflex-c-sb mb-8");
    			add_location(div1, file$e, 6, 0, 154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			if (if_block0) if_block0.m(h3, null);
    			append_dev(h3, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(minibutton, div0, null);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			insert_dev(target, t3, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (/*required*/ ctx[1]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(h3, span);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*required*/ ctx[1]) {
    				if (if_block1) {
    					if (dirty & /*required*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minibutton.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minibutton.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			destroy_component(minibutton);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t3);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { title } = $$props, { required = false } = $$props;
    	const writable_props = ["title", "required"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MsfBlock> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MsfBlock", $$slots, ['default']);

    	function info_handler(event) {
    		bubble($$self, event);
    	}

    	function delete_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, required, MiniButton });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, required, $$scope, $$slots, info_handler, delete_handler];
    }

    class MsfBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { title: 0, required: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MsfBlock",
    			options,
    			id: create_fragment$t.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<MsfBlock> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<MsfBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<MsfBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<MsfBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<MsfBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Checkbox.svelte generated by Svelte v3.24.1 */

    const file$f = "src\\ui\\Checkbox.svelte";

    function create_fragment$u(ctx) {
    	let label_1;
    	let div;
    	let t0;
    	let input;
    	let t1;
    	let span;
    	let t2;
    	let label_1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			div = element("div");
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			span = element("span");
    			t2 = text(/*label*/ ctx[3]);
    			attr_dev(div, "class", "w-checkbox-input w-checkbox-input--inputType-custom checkbox");
    			toggle_class(div, "w--redirected-checked", /*checked*/ ctx[0]);
    			add_location(div, file$f, 13, 2, 271);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "class", "svelte-midfjq");
    			add_location(input, file$f, 16, 2, 399);
    			attr_dev(span, "for", /*name*/ ctx[2]);
    			attr_dev(span, "class", "w-form-label leading-normal");
    			add_location(span, file$f, 17, 2, 453);
    			attr_dev(label_1, "class", label_1_class_value = "w-checkbox checkbox-field flex-auto " + /*extraClass*/ ctx[4]);
    			add_location(label_1, file$f, 12, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, div);
    			append_dev(label_1, t0);
    			append_dev(label_1, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(label_1, t1);
    			append_dev(label_1, span);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				toggle_class(div, "w--redirected-checked", /*checked*/ ctx[0]);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*label*/ 8) set_data_dev(t2, /*label*/ ctx[3]);

    			if (dirty & /*name*/ 4) {
    				attr_dev(span, "for", /*name*/ ctx[2]);
    			}

    			if (dirty & /*extraClass*/ 16 && label_1_class_value !== (label_1_class_value = "w-checkbox checkbox-field flex-auto " + /*extraClass*/ ctx[4])) {
    				attr_dev(label_1, "class", label_1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { id } = $$props,
    		{ name } = $$props,
    		{ checked = false } = $$props,
    		{ label } = $$props,
    		{ extraClass = "" } = $$props;

    	const writable_props = ["id", "name", "checked", "label", "extraClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", $$slots, []);

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("extraClass" in $$props) $$invalidate(4, extraClass = $$props.extraClass);
    	};

    	$$self.$capture_state = () => ({ id, name, checked, label, extraClass });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("extraClass" in $$props) $$invalidate(4, extraClass = $$props.extraClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, id, name, label, extraClass, input_change_handler];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			id: 1,
    			name: 2,
    			checked: 0,
    			label: 3,
    			extraClass: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$u.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[2] === undefined && !("name" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'name'");
    		}

    		if (/*label*/ ctx[3] === undefined && !("label" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'label'");
    		}
    	}

    	get id() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extraClass() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extraClass(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\MsfGlobal.svelte generated by Svelte v3.24.1 */

    function create_fragment$v(ctx) {
    	let checkbox0;
    	let updating_checked;
    	let t;
    	let checkbox1;
    	let updating_checked_1;
    	let current;

    	function checkbox0_checked_binding(value) {
    		/*checkbox0_checked_binding*/ ctx[2].call(null, value);
    	}

    	let checkbox0_props = {
    		id: "scroll-top",
    		name: "Scroll Top",
    		label: "Scroll to the top of the form when the user changes step.",
    		extraClass: "mb-4"
    	};

    	if (/*$msfStore*/ ctx[0].scrollTopOnStepChange !== void 0) {
    		checkbox0_props.checked = /*$msfStore*/ ctx[0].scrollTopOnStepChange;
    	}

    	checkbox0 = new Checkbox({ props: checkbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox0, "checked", checkbox0_checked_binding));

    	function checkbox1_checked_binding(value) {
    		/*checkbox1_checked_binding*/ ctx[3].call(null, value);
    	}

    	let checkbox1_props = {
    		id: "hide-nav",
    		name: "Hide Nav",
    		label: "Hide the navigation buttons when the form submits."
    	};

    	if (/*$msfStore*/ ctx[0].hiddeButtonsOnSubmit !== void 0) {
    		checkbox1_props.checked = /*$msfStore*/ ctx[0].hiddeButtonsOnSubmit;
    	}

    	checkbox1 = new Checkbox({ props: checkbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox1, "checked", checkbox1_checked_binding));

    	const block = {
    		c: function create() {
    			create_component(checkbox0.$$.fragment);
    			t = space();
    			create_component(checkbox1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkbox0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(checkbox1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const checkbox0_changes = {};

    			if (!updating_checked && dirty & /*$msfStore*/ 1) {
    				updating_checked = true;
    				checkbox0_changes.checked = /*$msfStore*/ ctx[0].scrollTopOnStepChange;
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox0.$set(checkbox0_changes);
    			const checkbox1_changes = {};

    			if (!updating_checked_1 && dirty & /*$msfStore*/ 1) {
    				updating_checked_1 = true;
    				checkbox1_changes.checked = /*$msfStore*/ ctx[0].hiddeButtonsOnSubmit;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			checkbox1.$set(checkbox1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);
    			transition_in(checkbox1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(checkbox1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkbox0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(checkbox1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(0, $msfStore = $$value));
    	let { key } = $$props;

    	// Functions
    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) {
    			set_store_value(msfStore, $msfStore.scrollTopOnStepChange = false, $msfStore);
    			set_store_value(msfStore, $msfStore.hiddeButtonsOnSubmit = true, $msfStore);
    		}
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MsfGlobal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MsfGlobal", $$slots, []);

    	function checkbox0_checked_binding(value) {
    		$msfStore.scrollTopOnStepChange = value;
    		msfStore.set($msfStore);
    	}

    	function checkbox1_checked_binding(value) {
    		$msfStore.hiddeButtonsOnSubmit = value;
    		msfStore.set($msfStore);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Checkbox,
    		msfStore,
    		msfOptional,
    		key,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$msfStore, key, checkbox0_checked_binding, checkbox1_checked_binding];
    }

    class MsfGlobal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MsfGlobal",
    			options,
    			id: create_fragment$v.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<MsfGlobal> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<MsfGlobal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<MsfGlobal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\MsfModal.svelte generated by Svelte v3.24.1 */
    const file$g = "src\\pages\\msf\\components\\MsfModal.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i].key;
    	child_ctx[5] = list[i].title;
    	return child_ctx;
    }

    // (20:6) {#each blocks as { key, title }
    function create_each_block$2(key_1, ctx) {
    	let li;
    	let t0_value = /*title*/ ctx[5] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[2](/*key*/ ctx[4], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "msf-optional");
    			add_location(li, file$g, 20, 8, 554);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*blocks*/ 1 && t0_value !== (t0_value = /*title*/ ctx[5] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(20:6) {#each blocks as { key, title }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$w(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let t1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div0_transition;
    	let t2;
    	let div1;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*blocks*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*key*/ ctx[4];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Add optional";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			attr_dev(h3, "class", "center");
    			add_location(h3, file$g, 17, 4, 414);
    			attr_dev(ul, "role", "list");
    			attr_dev(ul, "class", "msf-optional-list");
    			add_location(ul, file$g, 18, 4, 456);
    			attr_dev(div0, "class", "msf-modal-content");
    			add_location(div0, file$g, 16, 2, 334);
    			attr_dev(div1, "class", "modal-overlay svelte-z6buf6");
    			add_location(div1, file$g, 26, 2, 699);
    			attr_dev(div2, "class", "modal msf");
    			add_location(div2, file$g, 15, 0, 307);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler_1*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, blocks*/ 3) {
    				const each_value = /*blocks*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$2, null, get_each_context$2);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { x: 100, duration: 250 }, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 250 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { x: 100, duration: 250 }, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 250 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	
    	let { blocks = [] } = $$props;

    	// Functions
    	const dispatch = createEventDispatcher();

    	const writable_props = ["blocks"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MsfModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MsfModal", $$slots, []);
    	const click_handler = key => dispatch("addoptional", key);
    	const click_handler_1 = () => dispatch("closemodal");

    	$$self.$$set = $$props => {
    		if ("blocks" in $$props) $$invalidate(0, blocks = $$props.blocks);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		fly,
    		blocks,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("blocks" in $$props) $$invalidate(0, blocks = $$props.blocks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [blocks, dispatch, click_handler, click_handler_1];
    }

    class MsfModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, { blocks: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MsfModal",
    			options,
    			id: create_fragment$w.name
    		});
    	}

    	get blocks() {
    		throw new Error("<MsfModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blocks(value) {
    		throw new Error("<MsfModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\NextText.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1$1 } = globals;
    const file$h = "src\\pages\\msf\\components\\NextText.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (47:0) {#each params as param, index (param.id)}
    function create_each_block$3(key_2, ctx) {
    	let div;
    	let input0;
    	let updating_value;
    	let t0;
    	let input1;
    	let updating_value_1;
    	let t1;
    	let controlbutton;
    	let t2;
    	let div_class_value;
    	let div_transition;
    	let current;

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[4].call(null, value, /*index*/ ctx[11]);
    	}

    	let input0_props = {
    		label: "Step",
    		type: "number",
    		id: "next-text-step-" + /*index*/ ctx[11],
    		name: "Next Text Step " + /*index*/ ctx[11],
    		placeholder: "1",
    		min: "1",
    		extraClass: "_w-1-4"
    	};

    	if (/*params*/ ctx[0][/*index*/ ctx[11]].step !== void 0) {
    		input0_props.value = /*params*/ ctx[0][/*index*/ ctx[11]].step;
    	}

    	input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding));

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[5].call(null, value, /*index*/ ctx[11]);
    	}

    	let input1_props = {
    		label: "Text",
    		id: "next-text-" + /*index*/ ctx[11],
    		name: "Next Text " + /*index*/ ctx[11],
    		placeholder: "Eg: Next Step",
    		extraClass: "flex-auto mx-2"
    	};

    	if (/*params*/ ctx[0][/*index*/ ctx[11]].text !== void 0) {
    		input1_props.value = /*params*/ ctx[0][/*index*/ ctx[11]].text;
    	}

    	input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*index*/ ctx[11], ...args);
    	}

    	controlbutton = new ControlButton({
    			props: {
    				action: /*index*/ ctx[11] === 0 ? "add" : "delete"
    			},
    			$$inline: true
    		});

    	controlbutton.$on("click", click_handler);

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(input0.$$.fragment);
    			t0 = space();
    			create_component(input1.$$.fragment);
    			t1 = space();
    			create_component(controlbutton.$$.fragment);
    			t2 = space();

    			attr_dev(div, "class", div_class_value = "hflex-c-sb no-wrap " + (/*index*/ ctx[11] < /*params*/ ctx[0].length - 1
    			? "mb-8"
    			: ""));

    			add_location(div, file$h, 47, 2, 1454);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(input0, div, null);
    			append_dev(div, t0);
    			mount_component(input1, div, null);
    			append_dev(div, t1);
    			mount_component(controlbutton, div, null);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const input0_changes = {};
    			if (dirty & /*params*/ 1) input0_changes.id = "next-text-step-" + /*index*/ ctx[11];
    			if (dirty & /*params*/ 1) input0_changes.name = "Next Text Step " + /*index*/ ctx[11];

    			if (!updating_value && dirty & /*params*/ 1) {
    				updating_value = true;
    				input0_changes.value = /*params*/ ctx[0][/*index*/ ctx[11]].step;
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};
    			if (dirty & /*params*/ 1) input1_changes.id = "next-text-" + /*index*/ ctx[11];
    			if (dirty & /*params*/ 1) input1_changes.name = "Next Text " + /*index*/ ctx[11];

    			if (!updating_value_1 && dirty & /*params*/ 1) {
    				updating_value_1 = true;
    				input1_changes.value = /*params*/ ctx[0][/*index*/ ctx[11]].text;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    			const controlbutton_changes = {};
    			if (dirty & /*params*/ 1) controlbutton_changes.action = /*index*/ ctx[11] === 0 ? "add" : "delete";
    			controlbutton.$set(controlbutton_changes);

    			if (!current || dirty & /*params*/ 1 && div_class_value !== (div_class_value = "hflex-c-sb no-wrap " + (/*index*/ ctx[11] < /*params*/ ctx[0].length - 1
    			? "mb-8"
    			: ""))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(controlbutton.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(controlbutton.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(input0);
    			destroy_component(input1);
    			destroy_component(controlbutton);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(47:0) {#each params as param, index (param.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*params*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*param*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*params, addButtonText, removeButtonText*/ 7) {
    				const each_value = /*params*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkFilled$1(params) {
    	const filledParams = [];

    	params.forEach(param => {
    		const { step, text } = param;
    		if (step && text) filledParams.push({ step, text });
    	});

    	return filledParams;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(7, $msfStore = $$value));
    	
    	let { key } = $$props;

    	// Variables
    	// Check if there is data already stored and it has at least one item
    	let params = $msfStore[key] && $msfStore[key].length > 0
    	? $msfStore[key].map(param => Object.assign({ id: v4() }, param))
    	: [{ id: v4() }];

    	// Add new button text
    	function addButtonText() {
    		$$invalidate(0, params = [...params, { id: v4() }]);
    	}

    	// Remove button text
    	function removeButtonText(targetIndex) {
    		$$invalidate(0, params = params.filter((param, index) => index !== targetIndex));
    	}

    	// Delete params
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	// Remove from store if unselected
    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	const writable_props = ["key"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NextText> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NextText", $$slots, []);

    	function input0_value_binding(value, index) {
    		params[index].step = value;
    		$$invalidate(0, params);
    	}

    	function input1_value_binding(value, index) {
    		params[index].text = value;
    		$$invalidate(0, params);
    	}

    	const click_handler = index => {
    		if (index === 0) addButtonText(); else removeButtonText(index);
    	};

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		uuidv4: v4,
    		onDestroy,
    		slide,
    		Input,
    		ControlButton,
    		msfStore,
    		msfOptional,
    		key,
    		params,
    		checkFilled: checkFilled$1,
    		addButtonText,
    		removeButtonText,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*key, params*/ 9) {
    			// Reactive
    			 set_store_value(msfStore, $msfStore[key] = checkFilled$1(params), $msfStore);
    		}
    	};

    	return [
    		params,
    		addButtonText,
    		removeButtonText,
    		key,
    		input0_value_binding,
    		input1_value_binding,
    		click_handler
    	];
    }

    class NextText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, { key: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NextText",
    			options,
    			id: create_fragment$x.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[3] === undefined && !("key" in props)) {
    			console.warn("<NextText> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<NextText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<NextText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\components\WarningClass.svelte generated by Svelte v3.24.1 */

    function create_fragment$y(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		label: "Warning Class",
    		id: "warning-class",
    		name: "Warning Class",
    		placeholder: "Eg: warning"
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let $msfStore;
    	validate_store(msfStore, "msfStore");
    	component_subscribe($$self, msfStore, $$value => $$invalidate(3, $msfStore = $$value));
    	let { key } = $$props;

    	// Variables
    	let value = $msfStore[key] || "";

    	// Functions
    	function deleteParams() {
    		delete $msfStore[key];
    	}

    	onDestroy(() => {
    		if (!msfOptional.checkSelected(key)) deleteParams();
    	});

    	const writable_props = ["key"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WarningClass> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("WarningClass", $$slots, []);

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Input,
    		msfStore,
    		msfOptional,
    		key,
    		value,
    		deleteParams,
    		$msfStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, key*/ 3) {
    			// Reactive
    			 if (value.length > 0) set_store_value(msfStore, $msfStore[key] = value, $msfStore); else deleteParams();
    		}
    	};

    	return [value, key, input_value_binding];
    }

    class WarningClass extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, { key: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WarningClass",
    			options,
    			id: create_fragment$y.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !("key" in props)) {
    			console.warn("<WarningClass> was created without expected prop 'key'");
    		}
    	}

    	get key() {
    		throw new Error("<WarningClass>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<WarningClass>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const scriptSrc = 'https://cdn.jsdelivr.net/gh/brotame/advanced-webflow-forms@1.1.0/dist/awf.js';
    //prettier-ignore
    const starterForm = { "type": "@webflow/XscpData", "payload": { "nodes": [{ "_id": "38d2366b-4159-2510-38f3-6787f5878486", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f5878487", "38d2366b-4159-2510-38f3-6787f58784df", "38d2366b-4159-2510-38f3-6787f58784e2", "38d2366b-4159-2510-38f3-6787f58784ea"], "type": "FormWrapper", "data": { "form": { "type": "wrapper" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f5878487", "tag": "form", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f5878488", "38d2366b-4159-2510-38f3-6787f58784db"], "type": "FormForm", "data": { "attr": { "id": "msf", "name": "wf-form-Multi-Step-Form", "data-name": "Multi Step Form" }, "form": { "type": "form", "name": "Multi Step Form" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f5878488", "tag": "div", "classes": ["9e492cc5-3ba8-670c-f95e-8bb55c86b25a"], "children": ["38d2366b-4159-2510-38f3-6787f5878489", "38d2366b-4159-2510-38f3-6787f58784dc", "38d2366b-4159-2510-38f3-6787f58784dd", "38d2366b-4159-2510-38f3-6787f58784de"], "type": "SliderWrapper", "data": { "slider": { "navSpacing": 3, "autoplay": false, "delay": 4000, "iconArrows": true, "animation": "outin", "easing": "ease", "navRound": false, "hideArrows": false, "disableSwipe": true, "duration": 500, "infinite": false, "autoMax": 0, "type": "wrapper" }, "attr": { "data-animation": "outin", "data-disable-swipe": "1", "data-duration": "500" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f5878489", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f587848a", "38d2366b-4159-2510-38f3-6787f58784aa"], "type": "SliderMask", "data": { "slider": { "type": "slides" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f587848a", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f587848b"], "type": "SliderSlide", "data": { "tag": "div", "slider": { "type": "slide" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f587848b", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f587848c", "38d2366b-4159-2510-38f3-6787f587849d", "38d2366b-4159-2510-38f3-6787f587849f", "38d2366b-4159-2510-38f3-6787f58784a0", "38d2366b-4159-2510-38f3-6787f58784a2", "38d2366b-4159-2510-38f3-6787f58784a3", "38d2366b-4159-2510-38f3-6787f58784a5", "38d2366b-4159-2510-38f3-6787f58784a6"], "type": "Block", "data": { "tag": "div" } }, { "_id": "38d2366b-4159-2510-38f3-6787f587848c", "tag": "p", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f587848d", "38d2366b-4159-2510-38f3-6787f5878494", "38d2366b-4159-2510-38f3-6787f5878495", "38d2366b-4159-2510-38f3-6787f5878496", "38d2366b-4159-2510-38f3-6787f5878497", "f9618b03-efc9-eac9-4f27-19306d07c959", "2db53dad-7e56-58ab-fbac-23671270cb69", "38d2366b-4159-2510-38f3-6787f5878498", "38d2366b-4159-2510-38f3-6787f5878499", "65d30af1-1b1e-bcf1-c154-86697bc9cf3b", "212d637a-f59b-f007-e4db-cc6345cf004a"], "type": "Paragraph" }, { "_id": "38d2366b-4159-2510-38f3-6787f587848d", "text": true, "v": "This is a simple form build that has all kind of inputs in 2 steps." }, { "_id": "38d2366b-4159-2510-38f3-6787f5878494", "tag": "br", "classes": [], "children": [], "type": "LineBreak" }, { "_id": "38d2366b-4159-2510-38f3-6787f5878495", "text": true, "v": "‍" }, { "_id": "38d2366b-4159-2510-38f3-6787f5878496", "tag": "br", "classes": [], "children": [], "type": "LineBreak" }, { "_id": "38d2366b-4159-2510-38f3-6787f5878497", "text": true, "v": "You can edit and style it however you want: add, delete or move steps (slides), inputs, confirmation values, etc." }, { "_id": "f9618b03-efc9-eac9-4f27-19306d07c959", "tag": "br", "classes": [], "children": [], "type": "LineBreak" }, { "_id": "2db53dad-7e56-58ab-fbac-23671270cb69", "text": true, "v": "‍" }, { "_id": "38d2366b-4159-2510-38f3-6787f5878498", "tag": "br", "classes": [], "children": [], "type": "LineBreak" }, { "_id": "38d2366b-4159-2510-38f3-6787f5878499", "text": true, "v": "Don't forget to check the " }, { "_id": "65d30af1-1b1e-bcf1-c154-86697bc9cf3b", "tag": "a", "classes": [], "children": ["e80b0a1b-f8ba-13fd-dc36-f3dad133c7d4"], "type": "Link", "data": { "link": { "url": "https://advanced-forms.brota.me", "mode": "external", "target": "_blank" }, "attr": { "href": "#" } } }, { "_id": "e80b0a1b-f8ba-13fd-dc36-f3dad133c7d4", "text": true, "v": "Advanced Forms Builder" }, { "_id": "212d637a-f59b-f007-e4db-cc6345cf004a", "text": true, "v": " for further customization and information." }, { "_id": "38d2366b-4159-2510-38f3-6787f587849d", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f587849e"], "type": "FormBlockLabel", "data": { "form": { "type": "label" }, "attr": { "for": "name" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f587849e", "text": true, "v": "Name*" }, { "_id": "38d2366b-4159-2510-38f3-6787f587849f", "tag": "input", "classes": [], "children": [], "type": "FormTextInput", "data": { "attr": { "autofocus": false, "maxlength": 256, "name": "name", "data-name": "Name", "placeholder": "Input your name", "type": "text", "id": "name", "disabled": false, "required": true }, "form": { "type": "input", "name": "Name" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a0", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784a1"], "type": "FormBlockLabel", "data": { "form": { "type": "label" }, "attr": { "for": "email" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a1", "text": true, "v": "Email*" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a2", "tag": "input", "classes": [], "children": [], "type": "FormTextInput", "data": { "attr": { "autofocus": false, "maxlength": 256, "name": "email", "data-name": "Email", "placeholder": "Input your email", "type": "email", "id": "email", "disabled": false, "required": true }, "form": { "type": "input", "name": "Email" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a3", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784a4"], "type": "FormBlockLabel", "data": { "form": { "type": "label" }, "attr": { "for": "phone" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a4", "text": true, "v": "Phone*" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a5", "tag": "input", "classes": [], "children": [], "type": "FormTextInput", "data": { "attr": { "autofocus": false, "maxlength": 256, "name": "phone", "data-name": "Phone", "placeholder": "Input your phone number", "type": "tel", "id": "phone", "disabled": false, "required": true }, "form": { "type": "input", "name": "Phone" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a6", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784a7", "38d2366b-4159-2510-38f3-6787f58784a8"], "type": "FormCheckboxWrapper", "data": { "form": { "type": "checkbox" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a7", "tag": "input", "classes": [], "children": [], "type": "FormCheckboxInput", "data": { "attr": { "type": "checkbox", "id": "checkbox", "required": true, "data-name": "Checkbox", "name": "checkbox" }, "form": { "type": "checkbox-input", "name": "Checkbox" }, "inputType": "custom" } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a8", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784a9"], "type": "FormInlineLabel", "data": { "form": { "type": "checkbox-label" }, "attr": { "for": "Checkbox-2" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784a9", "text": true, "v": "This is a required checkbox." }, { "_id": "38d2366b-4159-2510-38f3-6787f58784aa", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784ab"], "type": "SliderSlide", "data": { "tag": "div", "slider": { "type": "slide" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784ab", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784ac", "38d2366b-4159-2510-38f3-6787f58784ae", "38d2366b-4159-2510-38f3-6787f58784af", "38d2366b-4159-2510-38f3-6787f58784b1", "38d2366b-4159-2510-38f3-6787f58784b2", "38d2366b-4159-2510-38f3-6787f58784b4", "38d2366b-4159-2510-38f3-6787f58784b8", "38d2366b-4159-2510-38f3-6787f58784bc", "38d2366b-4159-2510-38f3-6787f58784c0", "38d2366b-4159-2510-38f3-6787f58784c4", "38d2366b-4159-2510-38f3-6787f58784c6"], "type": "Block", "data": { "tag": "div" } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784ac", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784ad"], "type": "FormBlockLabel", "data": { "form": { "type": "label" }, "attr": { "for": "Service" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784ad", "text": true, "v": "Select*" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784ae", "tag": "select", "classes": [], "children": [], "v": "<option value=\"\">Select one...</option>\n<option value=\"First Choice\">First Choice</option>\n<option value=\"Second Choice\">Second Choice</option>\n<option value=\"Third Choice\">Third Choice</option>", "type": "FormSelect", "data": { "attr": { "id": "service", "name": "service", "required": true, "data-name": "Service" }, "form": { "type": "select", "opts": [{ "v": "", "t": "Select one..." }, { "v": "First Choice", "t": "First Choice" }, { "v": "Second Choice", "t": "Second Choice" }, { "v": "Third Choice", "t": "Third Choice" }], "name": "Service" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784af", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784b0"], "type": "FormBlockLabel", "data": { "form": { "type": "label" }, "attr": { "for": "amount" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b0", "text": true, "v": "Number*" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b1", "tag": "input", "classes": [], "children": [], "type": "FormTextInput", "data": { "attr": { "autofocus": false, "maxlength": 256, "name": "amount", "data-name": "Amount", "placeholder": "Choose amount", "type": "number", "id": "amount", "disabled": false, "required": true }, "form": { "type": "input", "name": "Amount" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b2", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784b3"], "type": "FormBlockLabel", "data": { "form": { "type": "label" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b3", "text": true, "v": "Radio Group*" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b4", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784b5", "38d2366b-4159-2510-38f3-6787f58784b6"], "type": "FormRadioWrapper", "data": { "form": { "type": "radio" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b5", "tag": "input", "classes": [], "children": [], "type": "FormRadioInput", "data": { "attr": { "type": "radio", "data-name": "Options", "id": "Option ", "name": "Options", "value": "Option 1", "required": true }, "form": { "type": "radio-input", "name": "Options" }, "inputType": "custom" } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b6", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784b7"], "type": "FormInlineLabel", "data": { "form": { "type": "radio-label" }, "attr": { "for": "Option " } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b7", "text": true, "v": "Option 1" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b8", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784b9", "38d2366b-4159-2510-38f3-6787f58784ba"], "type": "FormRadioWrapper", "data": { "form": { "type": "radio" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784b9", "tag": "input", "classes": [], "children": [], "type": "FormRadioInput", "data": { "attr": { "type": "radio", "data-name": "Options", "id": "Option -2", "name": "Options", "value": "Option 2", "required": true }, "form": { "type": "radio-input", "name": "Options" }, "inputType": "custom" } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784ba", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784bb"], "type": "FormInlineLabel", "data": { "form": { "type": "radio-label" }, "attr": { "for": "Option " } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784bb", "text": true, "v": "Option 2" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784bc", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784bd", "38d2366b-4159-2510-38f3-6787f58784be"], "type": "FormRadioWrapper", "data": { "form": { "type": "radio" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784bd", "tag": "input", "classes": [], "children": [], "type": "FormRadioInput", "data": { "attr": { "type": "radio", "data-name": "Options", "id": "Option -3", "name": "Options", "value": "Option 3", "required": true }, "form": { "type": "radio-input", "name": "Options" }, "inputType": "custom" } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784be", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784bf"], "type": "FormInlineLabel", "data": { "form": { "type": "radio-label" }, "attr": { "for": "Option " } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784bf", "text": true, "v": "Option 3" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784c0", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784c1", "38d2366b-4159-2510-38f3-6787f58784c2"], "type": "FormRadioWrapper", "data": { "form": { "type": "radio" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784c1", "tag": "input", "classes": [], "children": [], "type": "FormRadioInput", "data": { "attr": { "type": "radio", "data-name": "Options", "id": "Option -4", "name": "Options", "value": "Option 4", "required": true }, "form": { "type": "radio-input", "name": "Options" }, "inputType": "custom" } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784c2", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784c3"], "type": "FormInlineLabel", "data": { "form": { "type": "radio-label" }, "attr": { "for": "Option " } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784c3", "text": true, "v": "Option 4" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784c4", "tag": "label", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784c5"], "type": "FormBlockLabel", "data": { "form": { "type": "label" }, "attr": { "for": "notes" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784c5", "text": true, "v": "Text Area" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784c6", "tag": "textarea", "classes": [], "children": [], "type": "FormTextarea", "data": { "attr": { "placeholder": "Tell us anything you need.", "maxlength": 5000, "id": "notes", "name": "notes", "data-name": "Notes" }, "form": { "type": "textarea", "name": "Notes" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784dc", "tag": "div", "classes": ["07828abd-7f85-d22f-b6d9-ed59721f9f4b"], "children": [], "type": "SliderArrow", "data": { "slider": { "type": "arrow", "dir": "left" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784dd", "tag": "div", "classes": ["07828abd-7f85-d22f-b6d9-ed59721f9f4b"], "children": [], "type": "SliderArrow", "data": { "slider": { "type": "arrow", "dir": "right" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784de", "tag": "div", "classes": ["07828abd-7f85-d22f-b6d9-ed59721f9f4b"], "children": [], "type": "SliderNav", "data": { "slider": { "type": "nav" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784db", "tag": "input", "classes": ["07828abd-7f85-d22f-b6d9-ed59721f9f4b"], "children": [], "type": "FormButton", "data": { "attr": { "type": "submit", "value": "Submit", "data-wait": "Please wait..." }, "form": { "type": "button", "wait": "Please wait..." } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784df", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784e0"], "type": "FormSuccessMessage", "data": { "form": { "type": "msg-done" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784e0", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784e1"], "type": "Block", "data": { "tag": "div", "text": true } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784e1", "text": true, "v": "Thank you! Your submission has been received!" }, { "_id": "38d2366b-4159-2510-38f3-6787f58784e2", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784e3"], "type": "FormErrorMessage", "data": { "form": { "type": "msg-fail" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784e3", "tag": "div", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784e4"], "type": "Block", "data": { "tag": "div", "text": true } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784e4", "text": true, "v": "Oops! Something went wrong while submitting the form." }, { "_id": "38d2366b-4159-2510-38f3-6787f58784ea", "tag": "a", "classes": [], "children": ["38d2366b-4159-2510-38f3-6787f58784eb"], "type": "Link", "data": { "button": true, "link": { "mode": "section", "domId": "38d2366b-4159-2510-38f3-6787f5878487" }, "attr": { "id": "msf-next", "href": "#msf" } } }, { "_id": "38d2366b-4159-2510-38f3-6787f58784eb", "text": true, "v": "Next" }], "styles": [{ "_id": "9e492cc5-3ba8-670c-f95e-8bb55c86b25a", "fake": false, "type": "class", "name": "MSF Slider", "namespace": "", "comb": "", "styleLess": "height: auto; background-color: transparent;", "variants": {}, "children": [], "selector": null }, { "_id": "07828abd-7f85-d22f-b6d9-ed59721f9f4b", "fake": false, "type": "class", "name": "MSF Hidden", "namespace": "", "comb": "", "styleLess": "display: none;", "variants": {}, "children": [], "selector": null }], "assets": [], "ix1": [], "ix2": { "interactions": [], "events": [], "actionLists": [] } }, "meta": { "unlinkedSymbolCount": 0, "droppedLinks": 0, "dynBindRemovedCount": 0, "dynListBindRemovedCount": 0, "paginationRemovedCount": 0 } };

    /* src\pages\msf\components\WebflowSetup.svelte generated by Svelte v3.24.1 */
    const file$i = "src\\pages\\msf\\components\\WebflowSetup.svelte";

    function create_fragment$z(ctx) {
    	let p0;
    	let t1;
    	let ul1;
    	let li0;
    	let t2;
    	let span0;
    	let t4;
    	let t5;
    	let li5;
    	let p1;
    	let t7;
    	let ul0;
    	let li1;
    	let t8;
    	let span1;
    	let t10;
    	let t11;
    	let li2;
    	let t12;
    	let span2;
    	let t14;
    	let t15;
    	let li3;
    	let t16;
    	let span3;
    	let t18;
    	let t19;
    	let li4;
    	let t20;
    	let span4;
    	let t22;
    	let t23;
    	let p2;
    	let t24;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "Make sure your form meets the following requirements:";
    			t1 = space();
    			ul1 = element("ul");
    			li0 = element("li");
    			t2 = text("It has a submit button set to\r\n    ");
    			span0 = element("span");
    			span0.textContent = "display:none";
    			t4 = text("\r\n    . The script will use the button text and waiting text.");
    			t5 = space();
    			li5 = element("li");
    			p1 = element("p");
    			p1.textContent = "It has a slider inside it. The slider should have:";
    			t7 = space();
    			ul0 = element("ul");
    			li1 = element("li");
    			t8 = text("Swipe gestures\r\n        ");
    			span1 = element("span");
    			span1.textContent = "deactivated";
    			t10 = text("\r\n        .");
    			t11 = space();
    			li2 = element("li");
    			t12 = text("Auto-play slides\r\n        ");
    			span2 = element("span");
    			span2.textContent = "deactivated";
    			t14 = text("\r\n        .");
    			t15 = space();
    			li3 = element("li");
    			t16 = text("Its height forced to be\r\n        ");
    			span3 = element("span");
    			span3.textContent = "auto";
    			t18 = text("\r\n        .");
    			t19 = space();
    			li4 = element("li");
    			t20 = text("The slider arrows and nav set to\r\n        ");
    			span4 = element("span");
    			span4.textContent = "display:none";
    			t22 = text("\r\n        .");
    			t23 = space();
    			p2 = element("p");
    			t24 = text(/*buttonText*/ ctx[1]);
    			add_location(p0, file$i, 40, 0, 1143);
    			attr_dev(span0, "class", "opacity-75");
    			add_location(span0, file$i, 44, 4, 1270);
    			add_location(li0, file$i, 42, 2, 1225);
    			attr_dev(p1, "class", "mb-2");
    			add_location(p1, file$i, 48, 4, 1398);
    			attr_dev(span1, "class", "opacity-75");
    			add_location(span1, file$i, 52, 8, 1549);
    			attr_dev(li1, "class", "mb-1");
    			add_location(li1, file$i, 50, 6, 1498);
    			attr_dev(span2, "class", "opacity-75");
    			add_location(span2, file$i, 57, 8, 1677);
    			attr_dev(li2, "class", "mb-1");
    			add_location(li2, file$i, 55, 6, 1624);
    			attr_dev(span3, "class", "opacity-75");
    			add_location(span3, file$i, 62, 8, 1812);
    			attr_dev(li3, "class", "mb-1");
    			add_location(li3, file$i, 60, 6, 1752);
    			attr_dev(span4, "class", "opacity-75");
    			add_location(span4, file$i, 67, 8, 1936);
    			add_location(li4, file$i, 65, 6, 1880);
    			attr_dev(ul0, "role", "list");
    			add_location(ul0, file$i, 49, 4, 1474);
    			add_location(li5, file$i, 47, 2, 1388);
    			attr_dev(ul1, "role", "list");
    			add_location(ul1, file$i, 41, 0, 1205);
    			attr_dev(p2, "class", "button w-button");
    			attr_dev(p2, "role", "button");
    			toggle_class(p2, "error", /*notification*/ ctx[0] === "error");
    			add_location(p2, file$i, 73, 0, 2033);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li0);
    			append_dev(li0, t2);
    			append_dev(li0, span0);
    			append_dev(li0, t4);
    			append_dev(ul1, t5);
    			append_dev(ul1, li5);
    			append_dev(li5, p1);
    			append_dev(li5, t7);
    			append_dev(li5, ul0);
    			append_dev(ul0, li1);
    			append_dev(li1, t8);
    			append_dev(li1, span1);
    			append_dev(li1, t10);
    			append_dev(ul0, t11);
    			append_dev(ul0, li2);
    			append_dev(li2, t12);
    			append_dev(li2, span2);
    			append_dev(li2, t14);
    			append_dev(ul0, t15);
    			append_dev(ul0, li3);
    			append_dev(li3, t16);
    			append_dev(li3, span3);
    			append_dev(li3, t18);
    			append_dev(ul0, t19);
    			append_dev(ul0, li4);
    			append_dev(li4, t20);
    			append_dev(li4, span4);
    			append_dev(li4, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t24);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p2, "click", createCopy, false, false, false),
    					listen_dev(p2, "copy", /*handleCopy*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*buttonText*/ 2) set_data_dev(t24, /*buttonText*/ ctx[1]);

    			if (dirty & /*notification*/ 1) {
    				toggle_class(p2, "error", /*notification*/ ctx[0] === "error");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(p2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createCopy() {
    	document.execCommand("copy");
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let $msfCopy;
    	validate_store(msfCopy, "msfCopy");
    	component_subscribe($$self, msfCopy, $$value => $$invalidate(3, $msfCopy = $$value));
    	let notification = undefined;
    	let buttonText = "Copy Starter Form";

    	function handleCopy(e) {
    		try {
    			// Copy starter form JSON to clipboard
    			e.clipboardData.setData("application/json", JSON.stringify(starterForm).trim());

    			e.preventDefault();

    			// Set default selectors in the store (check Elements.svelte)
    			set_store_value(msfCopy, $msfCopy = true);

    			// Trigger notification
    			triggerNotification("success");
    		} catch(_a) {
    			triggerNotification("error");
    		}
    	}

    	function triggerNotification(state) {
    		if (notification) return;
    		$$invalidate(0, notification = state);

    		setTimeout(
    			() => {
    				$$invalidate(0, notification = undefined);
    			},
    			2000
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WebflowSetup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("WebflowSetup", $$slots, []);

    	$$self.$capture_state = () => ({
    		starterForm,
    		msfCopy,
    		notification,
    		buttonText,
    		createCopy,
    		handleCopy,
    		triggerNotification,
    		$msfCopy
    	});

    	$$self.$inject_state = $$props => {
    		if ("notification" in $$props) $$invalidate(0, notification = $$props.notification);
    		if ("buttonText" in $$props) $$invalidate(1, buttonText = $$props.buttonText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*notification*/ 1) {
    			// Reactive
    			 if (notification === "success") $$invalidate(1, buttonText = "Copied! Paste it in Webflow :)"); else if (notification === "error") $$invalidate(1, buttonText = "An error ocurred"); else $$invalidate(1, buttonText = "Copy Starter Form");
    		}
    	};

    	return [notification, buttonText, handleCopy];
    }

    class WebflowSetup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WebflowSetup",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    const body = document.body;
    let scrollPosition = 0;
    function disableScroll() {
        scrollPosition = window.pageYOffset;
        let oldWidth = body.clientWidth;
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollPosition}px`;
        body.style.width = `${oldWidth}px`;
    }
    function enableScroll() {
        if (body.style.overflow !== 'hidden')
            scrollPosition = window.pageYOffset;
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = ``;
        body.style.width = ``;
        window.scrollTo(0, scrollPosition);
    }

    /* src\icons\modal-close-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$A(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 512 512" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M353.047 256L498.604 110.444C516.465 92.5818 516.465 63.6218\r\n    498.604 45.7455L466.255 13.3964C448.393 -4.46545 419.433 -4.46545\r\n    401.556 13.3964L256 158.953L110.444 13.3964C92.5818 -4.46545 63.6218\r\n    -4.46545 45.7455 13.3964L13.3964 45.7455C-4.46545 63.6073 -4.46545\r\n    92.5673 13.3964 110.444L158.953 256L13.3964 401.556C-4.46545 419.418\r\n    -4.46545 448.378 13.3964 466.255L45.7455 498.604C63.6073 516.465\r\n    92.5818 516.465 110.444 498.604L256 353.047L401.556 498.604C419.418\r\n    516.465 448.393 516.465 466.255 498.604L498.604 466.255C516.465\r\n    448.393 516.465 419.433 498.604 401.556L353.047 256Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 512 512" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$A($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class ModalCloseIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});
    	}
    }

    /* src\icons\back-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$B(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 448 256" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M136.97 252.485L144.041 245.415C148.727 240.729 148.727\r\n    233.131 144.041 228.444L60.113 145H436C442.627 145 448 139.627\r\n    448 133V123C448 116.373 442.627 111 436 111H60.113L144.041\r\n    27.556C148.727 22.87 148.727 15.272 144.041 10.585L136.97\r\n    3.515C132.284 -1.171 124.686 -1.171 120 3.515L3.51499\r\n    119.515C-1.17101 124.201 -1.17101 131.799 3.51499 136.486L120\r\n    252.486C124.686 257.172 132.284 257.172 136.97 252.485Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 448 256" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$B($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class BackIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});
    	}
    }

    /* src\icons\next-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$C(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 448 256" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M311.03 3.51501L303.959 10.585C299.273 15.271 299.273\r\n    22.869 303.959 27.556L387.887 111H12C5.373 111 0 116.373 0\r\n    123V133C0 139.627 5.373 145 12 145H387.887L303.959\r\n    228.444C299.273 233.13 299.273 240.728 303.959 245.415L311.03\r\n    252.485C315.716 257.171 323.314 257.171 328 252.485L444.485\r\n    136.485C449.171 131.799 449.171 124.201 444.485 119.514L328\r\n    3.51501C323.314 -1.17199 315.716 -1.17199 311.03 3.51501Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 448 256" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$C($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class NextIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});
    	}
    }

    /* src\ui\ModalContent.svelte generated by Svelte v3.24.1 */
    const file$j = "src\\ui\\ModalContent.svelte";

    // (79:10) {#if !isLast}
    function create_if_block$6(ctx) {
    	let nexticon;
    	let current;
    	nexticon = new NextIcon({ props: { class: "icon" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nexticon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nexticon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nexticon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nexticon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nexticon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(79:10) {#if !isLast}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let div12;
    	let div9;
    	let div7;
    	let h3;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let div6;
    	let div3;
    	let backicon;
    	let t4;
    	let div2;
    	let t6;
    	let div5;
    	let div4;
    	let t7_value = (/*isLast*/ ctx[5] ? "Finish" : "Next") + "";
    	let t7;
    	let t8;
    	let t9;
    	let div8;
    	let video;
    	let source0;
    	let source0_src_value;
    	let source1;
    	let source1_src_value;
    	let video_autoplay_value;
    	let video_loop_value;
    	let video_muted_value;
    	let video_playsinline_value;
    	let t10;
    	let div11;
    	let div10;
    	let modalcloseicon;
    	let div12_transition;
    	let current;
    	let mounted;
    	let dispose;

    	backicon = new BackIcon({
    			props: { class: "icon mr-2" },
    			$$inline: true
    		});

    	let if_block = !/*isLast*/ ctx[5] && create_if_block$6(ctx);
    	modalcloseicon = new ModalCloseIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div6 = element("div");
    			div3 = element("div");
    			create_component(backicon.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "Back";
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block) if_block.c();
    			t9 = space();
    			div8 = element("div");
    			video = element("video");
    			source0 = element("source");
    			source1 = element("source");
    			t10 = space();
    			div11 = element("div");
    			div10 = element("div");
    			create_component(modalcloseicon.$$.fragment);
    			attr_dev(h3, "class", "mb-2");
    			add_location(h3, file$j, 53, 6, 1221);
    			attr_dev(div0, "class", "logic-block-divider mb-4");
    			add_location(div0, file$j, 56, 6, 1284);
    			attr_dev(div1, "class", "modal-text");
    			add_location(div1, file$j, 59, 6, 1355);
    			attr_dev(div2, "class", "uppercase");
    			add_location(div2, file$j, 72, 10, 1711);
    			attr_dev(div3, "class", "modal-nav svelte-1gc8jlh");
    			toggle_class(div3, "hidden", /*currentSlide*/ ctx[0] === 0);
    			add_location(div3, file$j, 67, 8, 1529);
    			attr_dev(div4, "class", "uppercase mr-2");
    			add_location(div4, file$j, 77, 10, 1880);
    			attr_dev(div5, "class", "modal-nav");
    			add_location(div5, file$j, 76, 8, 1811);
    			attr_dev(div6, "class", "hflex-c-sb mt-auto");
    			add_location(div6, file$j, 64, 6, 1455);
    			attr_dev(div7, "class", "vflex-str-s");
    			add_location(div7, file$j, 50, 4, 1164);
    			if (source0.src !== (source0_src_value = /*video1*/ ctx[3])) attr_dev(source0, "src", source0_src_value);
    			add_location(source0, file$j, 95, 8, 2359);
    			if (source1.src !== (source1_src_value = /*video2*/ ctx[4])) attr_dev(source1, "src", source1_src_value);
    			add_location(source1, file$j, 96, 8, 2392);
    			video.autoplay = video_autoplay_value = true;
    			video.loop = video_loop_value = true;
    			video.muted = video_muted_value = true;
    			video.playsInline = video_playsinline_value = true;
    			attr_dev(video, "class", "svelte-1gc8jlh");
    			add_location(video, file$j, 89, 6, 2212);
    			attr_dev(div8, "class", "vflex-str-c modal-image svelte-1gc8jlh");
    			add_location(div8, file$j, 86, 4, 2099);
    			attr_dev(div9, "class", "modal-content");
    			add_location(div9, file$j, 47, 2, 1101);
    			attr_dev(div10, "class", "_w-full vflex-str-c");
    			add_location(div10, file$j, 103, 4, 2554);
    			attr_dev(div11, "class", "modal-close");
    			add_location(div11, file$j, 102, 2, 2483);
    			attr_dev(div12, "class", "modal-content-wrap");
    			add_location(div12, file$j, 43, 0, 996);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div9);
    			append_dev(div9, div7);
    			append_dev(div7, h3);
    			append_dev(h3, t0);
    			append_dev(div7, t1);
    			append_dev(div7, div0);
    			append_dev(div7, t2);
    			append_dev(div7, div1);
    			div1.innerHTML = /*content*/ ctx[2];
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			mount_component(backicon, div3, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, t7);
    			append_dev(div5, t8);
    			if (if_block) if_block.m(div5, null);
    			append_dev(div9, t9);
    			append_dev(div9, div8);
    			append_dev(div8, video);
    			append_dev(video, source0);
    			append_dev(video, source1);
    			/*video_binding*/ ctx[10](video);
    			append_dev(div12, t10);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			mount_component(modalcloseicon, div10, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(div5, "click", /*click_handler_1*/ ctx[9], false, false, false),
    					listen_dev(div11, "click", /*click_handler_2*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);
    			if (!current || dirty & /*content*/ 4) div1.innerHTML = /*content*/ ctx[2];
    			if (dirty & /*currentSlide*/ 1) {
    				toggle_class(div3, "hidden", /*currentSlide*/ ctx[0] === 0);
    			}

    			if ((!current || dirty & /*isLast*/ 32) && t7_value !== (t7_value = (/*isLast*/ ctx[5] ? "Finish" : "Next") + "")) set_data_dev(t7, t7_value);

    			if (!/*isLast*/ ctx[5]) {
    				if (if_block) {
    					if (dirty & /*isLast*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div5, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*video1*/ 8 && source0.src !== (source0_src_value = /*video1*/ ctx[3])) {
    				attr_dev(source0, "src", source0_src_value);
    			}

    			if (!current || dirty & /*video2*/ 16 && source1.src !== (source1_src_value = /*video2*/ ctx[4])) {
    				attr_dev(source1, "src", source1_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backicon.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(modalcloseicon.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div12_transition) div12_transition = create_bidirectional_transition(div12, fly, { y: 100, duration: 250, easing: quintOut }, true);
    				div12_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backicon.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(modalcloseicon.$$.fragment, local);
    			if (!div12_transition) div12_transition = create_bidirectional_transition(div12, fly, { y: 100, duration: 250, easing: quintOut }, false);
    			div12_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			destroy_component(backicon);
    			if (if_block) if_block.d();
    			/*video_binding*/ ctx[10](null);
    			destroy_component(modalcloseicon);
    			if (detaching && div12_transition) div12_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	let { currentSlide } = $$props,
    		{ title } = $$props,
    		{ content } = $$props,
    		{ video1 } = $$props,
    		{ video2 } = $$props,
    		{ isLast } = $$props;

    	// Variables
    	let videoElement;

    	// Functions
    	const dispatch = createEventDispatcher();

    	function restartVideo() {
    		if (!videoElement) return;
    		videoElement.load();
    	}

    	const writable_props = ["currentSlide", "title", "content", "video1", "video2", "isLast"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ModalContent> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ModalContent", $$slots, []);
    	const click_handler = () => dispatch("previous");
    	const click_handler_1 = () => dispatch("next");

    	function video_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			videoElement = $$value;
    			$$invalidate(6, videoElement);
    		});
    	}

    	const click_handler_2 = () => dispatch("closemodal");

    	$$self.$$set = $$props => {
    		if ("currentSlide" in $$props) $$invalidate(0, currentSlide = $$props.currentSlide);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("video1" in $$props) $$invalidate(3, video1 = $$props.video1);
    		if ("video2" in $$props) $$invalidate(4, video2 = $$props.video2);
    		if ("isLast" in $$props) $$invalidate(5, isLast = $$props.isLast);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fly,
    		quintOut,
    		ModalCloseIcon,
    		BackIcon,
    		NextIcon,
    		currentSlide,
    		title,
    		content,
    		video1,
    		video2,
    		isLast,
    		videoElement,
    		dispatch,
    		restartVideo
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentSlide" in $$props) $$invalidate(0, currentSlide = $$props.currentSlide);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("video1" in $$props) $$invalidate(3, video1 = $$props.video1);
    		if ("video2" in $$props) $$invalidate(4, video2 = $$props.video2);
    		if ("isLast" in $$props) $$invalidate(5, isLast = $$props.isLast);
    		if ("videoElement" in $$props) $$invalidate(6, videoElement = $$props.videoElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*video1*/ 8) {
    			// Reactive
    			 if (video1) restartVideo();
    		}
    	};

    	return [
    		currentSlide,
    		title,
    		content,
    		video1,
    		video2,
    		isLast,
    		videoElement,
    		dispatch,
    		click_handler,
    		click_handler_1,
    		video_binding,
    		click_handler_2
    	];
    }

    class ModalContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {
    			currentSlide: 0,
    			title: 1,
    			content: 2,
    			video1: 3,
    			video2: 4,
    			isLast: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalContent",
    			options,
    			id: create_fragment$D.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentSlide*/ ctx[0] === undefined && !("currentSlide" in props)) {
    			console.warn("<ModalContent> was created without expected prop 'currentSlide'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<ModalContent> was created without expected prop 'title'");
    		}

    		if (/*content*/ ctx[2] === undefined && !("content" in props)) {
    			console.warn("<ModalContent> was created without expected prop 'content'");
    		}

    		if (/*video1*/ ctx[3] === undefined && !("video1" in props)) {
    			console.warn("<ModalContent> was created without expected prop 'video1'");
    		}

    		if (/*video2*/ ctx[4] === undefined && !("video2" in props)) {
    			console.warn("<ModalContent> was created without expected prop 'video2'");
    		}

    		if (/*isLast*/ ctx[5] === undefined && !("isLast" in props)) {
    			console.warn("<ModalContent> was created without expected prop 'isLast'");
    		}
    	}

    	get currentSlide() {
    		throw new Error("<ModalContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentSlide(value) {
    		throw new Error("<ModalContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ModalContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ModalContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content() {
    		throw new Error("<ModalContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<ModalContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get video1() {
    		throw new Error("<ModalContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video1(value) {
    		throw new Error("<ModalContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get video2() {
    		throw new Error("<ModalContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video2(value) {
    		throw new Error("<ModalContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLast() {
    		throw new Error("<ModalContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLast(value) {
    		throw new Error("<ModalContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Modal.svelte generated by Svelte v3.24.1 */
    const file$k = "src\\ui\\Modal.svelte";

    function create_fragment$E(ctx) {
    	let div1;
    	let modalcontent;
    	let t;
    	let div0;
    	let div0_intro;
    	let current;
    	let mounted;
    	let dispose;

    	const modalcontent_spread_levels = [
    		/*slides*/ ctx[0][/*currentSlide*/ ctx[1]],
    		{ currentSlide: /*currentSlide*/ ctx[1] },
    		{
    			isLast: /*currentSlide*/ ctx[1] === /*slides*/ ctx[0].length - 1
    		}
    	];

    	let modalcontent_props = {};

    	for (let i = 0; i < modalcontent_spread_levels.length; i += 1) {
    		modalcontent_props = assign(modalcontent_props, modalcontent_spread_levels[i]);
    	}

    	modalcontent = new ModalContent({
    			props: modalcontent_props,
    			$$inline: true
    		});

    	modalcontent.$on("closemodal", /*closemodal_handler*/ ctx[5]);
    	modalcontent.$on("previous", /*previousSlide*/ ctx[3]);
    	modalcontent.$on("next", /*next_handler*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(modalcontent.$$.fragment);
    			t = space();
    			div0 = element("div");
    			attr_dev(div0, "class", "modal-overlay svelte-z6buf6");
    			add_location(div0, file$k, 43, 2, 983);
    			attr_dev(div1, "class", "modal");
    			add_location(div1, file$k, 32, 0, 662);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(modalcontent, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modalcontent_changes = (dirty & /*slides, currentSlide*/ 3)
    			? get_spread_update(modalcontent_spread_levels, [
    					get_spread_object(/*slides*/ ctx[0][/*currentSlide*/ ctx[1]]),
    					dirty & /*currentSlide*/ 2 && { currentSlide: /*currentSlide*/ ctx[1] },
    					{
    						isLast: /*currentSlide*/ ctx[1] === /*slides*/ ctx[0].length - 1
    					}
    				])
    			: {};

    			modalcontent.$set(modalcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalcontent.$$.fragment, local);

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, fade, { duration: 100 });
    					div0_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(modalcontent);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	
    	
    	let { slides } = $$props;

    	// Variables
    	let currentSlide = 0;

    	// Functions
    	function nextSlide() {
    		$$invalidate(1, currentSlide += 1);
    	}

    	function previousSlide() {
    		$$invalidate(1, currentSlide -= 1);
    	}

    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		disableScroll();
    	});

    	onDestroy(() => {
    		enableScroll();
    	});

    	const writable_props = ["slides"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, []);

    	function closemodal_handler(event) {
    		bubble($$self, event);
    	}

    	const next_handler = () => {
    		if (currentSlide === slides.length - 1) dispatch("closemodal"); else nextSlide();
    	};

    	const click_handler = () => dispatch("closemodal");

    	$$self.$$set = $$props => {
    		if ("slides" in $$props) $$invalidate(0, slides = $$props.slides);
    	};

    	$$self.$capture_state = () => ({
    		disableScroll,
    		enableScroll,
    		createEventDispatcher,
    		onMount,
    		onDestroy,
    		fade,
    		ModalContent,
    		slides,
    		currentSlide,
    		nextSlide,
    		previousSlide,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("slides" in $$props) $$invalidate(0, slides = $$props.slides);
    		if ("currentSlide" in $$props) $$invalidate(1, currentSlide = $$props.currentSlide);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		slides,
    		currentSlide,
    		nextSlide,
    		previousSlide,
    		dispatch,
    		closemodal_handler,
    		next_handler,
    		click_handler
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, { slides: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$E.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*slides*/ ctx[0] === undefined && !("slides" in props)) {
    			console.warn("<Modal> was created without expected prop 'slides'");
    		}
    	}

    	get slides() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slides(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\msf\Msf.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1$2 } = globals;
    const file$l = "src\\pages\\msf\\Msf.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i].key;
    	child_ctx[19] = list[i].title;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i].key;
    	child_ctx[19] = list[i].title;
    	return child_ctx;
    }

    // (97:6) {#if $msfActivated}
    function create_if_block_2(ctx) {
    	let div0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let div0_transition;
    	let t0;
    	let div1;
    	let h2;
    	let t2;
    	let controlbutton;
    	let div1_transition;
    	let t3;
    	let div2;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let div2_transition;
    	let current;
    	let each_value_1 = /*$msfRequired*/ ctx[5];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*key*/ ctx[18];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	controlbutton = new ControlButton({ $$inline: true });
    	controlbutton.$on("click", /*click_handler*/ ctx[14]);
    	let each_value = /*optionalBlocks*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*key*/ ctx[18];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Optional setup";
    			t2 = space();
    			create_component(controlbutton.$$.fragment);
    			t3 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "msf-grid first");
    			add_location(div0, file$l, 98, 8, 3459);
    			attr_dev(h2, "class", "mb-0 mr-4");
    			add_location(h2, file$l, 115, 10, 4079);
    			attr_dev(div1, "class", "hflex-c-s mb-6");
    			add_location(div1, file$l, 114, 8, 3997);
    			attr_dev(div2, "class", "msf-grid");
    			add_location(div2, file$l, 120, 8, 4248);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			mount_component(controlbutton, div1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$msfRequired, openModal, components*/ 352) {
    				const each_value_1 = /*$msfRequired*/ ctx[5];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div0, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (dirty & /*optionalBlocks, openModal, deleteOptional, components*/ 2372) {
    				const each_value = /*optionalBlocks*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div2, fix_and_outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 250 }, true);
    					div0_transition.run(1);
    				});
    			}

    			transition_in(controlbutton.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 250 }, true);
    					div1_transition.run(1);
    				});
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (local) {
    				add_render_callback(() => {
    					if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 250 }, true);
    					div2_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			if (local) {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 250 }, false);
    				div0_transition.run(0);
    			}

    			transition_out(controlbutton.$$.fragment, local);

    			if (local) {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 250 }, false);
    				div1_transition.run(0);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (local) {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 250 }, false);
    				div2_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(controlbutton);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(97:6) {#if $msfActivated}",
    		ctx
    	});

    	return block;
    }

    // (103:14) <MsfBlock                  {title}                  required={true}                  on:info={() => openModal('info', key)}>
    function create_default_slot_2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[6][/*key*/ ctx[18]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*components*/ ctx[6][/*key*/ ctx[18]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(103:14) <MsfBlock                  {title}                  required={true}                  on:info={() => openModal('info', key)}>",
    		ctx
    	});

    	return block;
    }

    // (100:10) {#each $msfRequired as { key, title }
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let msfblock;
    	let t;
    	let div_transition;
    	let current;

    	function info_handler(...args) {
    		return /*info_handler*/ ctx[13](/*key*/ ctx[18], ...args);
    	}

    	msfblock = new MsfBlock({
    			props: {
    				title: /*title*/ ctx[19],
    				required: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	msfblock.$on("info", info_handler);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(msfblock.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "msf-block");
    			add_location(div, file$l, 100, 12, 3599);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(msfblock, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const msfblock_changes = {};
    			if (dirty & /*$msfRequired*/ 32) msfblock_changes.title = /*title*/ ctx[19];

    			if (dirty & /*$$scope, $msfRequired*/ 16777248) {
    				msfblock_changes.$$scope = { dirty, ctx };
    			}

    			msfblock.$set(msfblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(msfblock.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(msfblock.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(msfblock);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(100:10) {#each $msfRequired as { key, title }",
    		ctx
    	});

    	return block;
    }

    // (128:14) <MsfBlock                  {title}                  on:info={() => openModal('info', key)}                  on:delete={() => deleteOptional(key)}>
    function create_default_slot_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[6][/*key*/ ctx[18]];

    	function switch_props(ctx) {
    		return {
    			props: { key: /*key*/ ctx[18] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*optionalBlocks*/ 4) switch_instance_changes.key = /*key*/ ctx[18];

    			if (switch_value !== (switch_value = /*components*/ ctx[6][/*key*/ ctx[18]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(128:14) <MsfBlock                  {title}                  on:info={() => openModal('info', key)}                  on:delete={() => deleteOptional(key)}>",
    		ctx
    	});

    	return block;
    }

    // (122:10) {#each optionalBlocks as { key, title }
    function create_each_block$4(key_1, ctx) {
    	let div;
    	let msfblock;
    	let t;
    	let div_transition;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	function info_handler_1(...args) {
    		return /*info_handler_1*/ ctx[15](/*key*/ ctx[18], ...args);
    	}

    	function delete_handler(...args) {
    		return /*delete_handler*/ ctx[16](/*key*/ ctx[18], ...args);
    	}

    	msfblock = new MsfBlock({
    			props: {
    				title: /*title*/ ctx[19],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	msfblock.$on("info", info_handler_1);
    	msfblock.$on("delete", delete_handler);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(msfblock.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "msf-block");
    			add_location(div, file$l, 122, 12, 4384);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(msfblock, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const msfblock_changes = {};
    			if (dirty & /*optionalBlocks*/ 4) msfblock_changes.title = /*title*/ ctx[19];

    			if (dirty & /*$$scope, optionalBlocks*/ 16777220) {
    				msfblock_changes.$$scope = { dirty, ctx };
    			}

    			msfblock.$set(msfblock_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 250 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(msfblock.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(msfblock.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(msfblock);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(122:10) {#each optionalBlocks as { key, title }",
    		ctx
    	});

    	return block;
    }

    // (147:33) 
    function create_if_block_1$4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: { slides: /*slides*/ ctx[1] },
    			$$inline: true
    		});

    	modal.$on("closemodal", /*closeModal*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty & /*slides*/ 2) modal_changes.slides = /*slides*/ ctx[1];
    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(147:33) ",
    		ctx
    	});

    	return block;
    }

    // (142:2) {#if showModal === 'optional'}
    function create_if_block$7(ctx) {
    	let msfmodal;
    	let current;

    	msfmodal = new MsfModal({
    			props: {
    				blocks: /*unselectedOptionalBlocks*/ ctx[3]
    			},
    			$$inline: true
    		});

    	msfmodal.$on("closemodal", /*closeModal*/ ctx[9]);
    	msfmodal.$on("addoptional", /*addOptional*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(msfmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(msfmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const msfmodal_changes = {};
    			if (dirty & /*unselectedOptionalBlocks*/ 8) msfmodal_changes.blocks = /*unselectedOptionalBlocks*/ ctx[3];
    			msfmodal.$set(msfmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(msfmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(msfmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(msfmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(142:2) {#if showModal === 'optional'}",
    		ctx
    	});

    	return block;
    }

    // (73:0) <TransitionWrap>
    function create_default_slot$1(ctx) {
    	let section;
    	let hero;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let h2;
    	let t2_value = (/*$msfActivated*/ ctx[4] ? "Required setup" : "Activate") + "";
    	let t2;
    	let t3;
    	let controlbutton;
    	let t4;
    	let t5;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;

    	hero = new Hero({
    			props: {
    				title: "Multi Steps",
    				subtitle: "Set up multi-step functionality for your forms.",
    				primaryText: "Quick intro",
    				secondaryText: "Watch tutorials"
    			},
    			$$inline: true
    		});

    	hero.$on("primaryclick", /*primaryclick_handler*/ ctx[12]);

    	controlbutton = new ControlButton({
    			props: {
    				action: /*$msfActivated*/ ctx[4] ? "delete" : "add"
    			},
    			$$inline: true
    		});

    	controlbutton.$on("click", /*toggleMsf*/ ctx[7]);
    	let if_block0 = /*$msfActivated*/ ctx[4] && create_if_block_2(ctx);
    	const if_block_creators = [create_if_block$7, create_if_block_1$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*showModal*/ ctx[0] === "optional") return 0;
    		if (/*showModal*/ ctx[0] === "info") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(hero.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			create_component(controlbutton.$$.fragment);
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "logic-block-divider my-12");
    			add_location(div0, file$l, 84, 6, 3045);
    			attr_dev(h2, "class", "mb-0 mr-4");
    			add_location(h2, file$l, 88, 8, 3166);
    			attr_dev(div1, "class", "hflex-c-s mb-6");
    			add_location(div1, file$l, 87, 6, 3128);
    			attr_dev(div2, "class", "container max-w-3xl");
    			add_location(div2, file$l, 83, 4, 3004);
    			attr_dev(section, "class", "section");
    			add_location(section, file$l, 73, 2, 2689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(hero, section, null);
    			append_dev(section, t0);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t2);
    			append_dev(div1, t3);
    			mount_component(controlbutton, div1, null);
    			append_dev(div2, t4);
    			if (if_block0) if_block0.m(div2, null);
    			insert_dev(target, t5, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$msfActivated*/ 16) && t2_value !== (t2_value = (/*$msfActivated*/ ctx[4] ? "Required setup" : "Activate") + "")) set_data_dev(t2, t2_value);
    			const controlbutton_changes = {};
    			if (dirty & /*$msfActivated*/ 16) controlbutton_changes.action = /*$msfActivated*/ ctx[4] ? "delete" : "add";
    			controlbutton.$set(controlbutton_changes);

    			if (/*$msfActivated*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$msfActivated*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(controlbutton.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(controlbutton.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(hero);
    			destroy_component(controlbutton);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t5);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(73:0) <TransitionWrap>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$F(ctx) {
    	let transitionwrap;
    	let current;

    	transitionwrap = new TransitionWrap({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(transitionwrap.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(transitionwrap, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const transitionwrap_changes = {};

    			if (dirty & /*$$scope, unselectedOptionalBlocks, showModal, slides, optionalBlocks, $msfRequired, $msfActivated*/ 16777279) {
    				transitionwrap_changes.$$scope = { dirty, ctx };
    			}

    			transitionwrap.$set(transitionwrap_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transitionwrap.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transitionwrap.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transitionwrap, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let $msfOptional;
    	let $msfActivated;
    	let $msfRequired;
    	validate_store(msfOptional, "msfOptional");
    	component_subscribe($$self, msfOptional, $$value => $$invalidate(17, $msfOptional = $$value));
    	validate_store(msfActivated, "msfActivated");
    	component_subscribe($$self, msfActivated, $$value => $$invalidate(4, $msfActivated = $$value));
    	validate_store(msfRequired, "msfRequired");
    	component_subscribe($$self, msfRequired, $$value => $$invalidate(5, $msfRequired = $$value));
    	

    	// Variables
    	let showModal = undefined;

    	let slides = [];

    	const components = {
    		alertSelector: AlertElement,
    		alertText: AlertText,
    		backText: BackText,
    		backSelector: BackButton,
    		completedPercentageSelector: DisplayCompleted,
    		currentStepSelector: DisplayCurrentStep,
    		customNav: CustomNav,
    		displayValues: DisplayValues,
    		elements: Elements,
    		hiddenForm: HiddenForm,
    		msfGlobal: MsfGlobal,
    		nextText: NextText,
    		warningClass: WarningClass,
    		webflowSetup: WebflowSetup
    	};

    	// Functions
    	function toggleMsf() {
    		if ($msfActivated) {
    			set_store_value(msfRequired, $msfRequired = $msfRequired.map(block => Object.assign(Object.assign({}, block), { selected: false })));
    		}

    		set_store_value(msfActivated, $msfActivated = !$msfActivated);
    	}

    	function openModal(mode, key) {
    		if (key) $$invalidate(1, slides = msfSlides[key]);
    		$$invalidate(0, showModal = mode);
    	}

    	function closeModal() {
    		$$invalidate(0, showModal = undefined);
    	}

    	function addOptional(e) {
    		const key = e.detail;
    		msfOptional.modify(key, true);
    		$$invalidate(0, showModal = undefined);
    	}

    	function deleteOptional(key) {
    		msfOptional.modify(key, false);
    	}

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Msf> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Msf", $$slots, []);
    	const primaryclick_handler = () => openModal("info", "intro");
    	const info_handler = key => openModal("info", key);
    	const click_handler = () => openModal("optional");
    	const info_handler_1 = key => openModal("info", key);
    	const delete_handler = key => deleteOptional(key);

    	$$self.$capture_state = () => ({
    		fade,
    		flip,
    		msfActivated,
    		msfRequired,
    		msfOptional,
    		msfSlides,
    		AlertElement,
    		AlertText,
    		BackButton,
    		BackText,
    		CustomNav,
    		DisplayCompleted,
    		DisplayCurrentStep,
    		DisplayValues,
    		Elements,
    		HiddenForm,
    		MsfBlock,
    		MsfGlobal,
    		MsfModal,
    		NextText,
    		WarningClass,
    		WebflowSetup,
    		ControlButton,
    		Hero,
    		TransitionWrap,
    		Modal,
    		showModal,
    		slides,
    		components,
    		toggleMsf,
    		openModal,
    		closeModal,
    		addOptional,
    		deleteOptional,
    		optionalBlocks,
    		$msfOptional,
    		unselectedOptionalBlocks,
    		$msfActivated,
    		$msfRequired
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("slides" in $$props) $$invalidate(1, slides = $$props.slides);
    		if ("optionalBlocks" in $$props) $$invalidate(2, optionalBlocks = $$props.optionalBlocks);
    		if ("unselectedOptionalBlocks" in $$props) $$invalidate(3, unselectedOptionalBlocks = $$props.unselectedOptionalBlocks);
    	};

    	let optionalBlocks;
    	let unselectedOptionalBlocks;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$msfOptional*/ 131072) {
    			// Reactive
    			 $$invalidate(2, optionalBlocks = $msfOptional.filter(block => block.selected));
    		}

    		if ($$self.$$.dirty & /*$msfOptional*/ 131072) {
    			 $$invalidate(3, unselectedOptionalBlocks = $msfOptional.filter(block => !block.selected));
    		}
    	};

    	return [
    		showModal,
    		slides,
    		optionalBlocks,
    		unselectedOptionalBlocks,
    		$msfActivated,
    		$msfRequired,
    		components,
    		toggleMsf,
    		openModal,
    		closeModal,
    		addOptional,
    		deleteOptional,
    		primaryclick_handler,
    		info_handler,
    		click_handler,
    		info_handler_1,
    		delete_handler
    	];
    }

    class Msf extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Msf",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Built-in value references. */
    var Symbol$1 = root.Symbol;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype,
        objectProto$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /* Built-in method references that are verified to be native. */
    var WeakMap = getNative(root, 'WeakMap');

    /** Built-in value references. */
    var objectCreate = Object.create;

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$2.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

      return value === proto;
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty$3.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    /** Detect free variable `exports`. */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag$1 = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /** Detect free variable `exports`. */
    var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports$1 && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$4.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = overArg(Object.keys, Object);

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$5.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty$6.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn$1(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$8.call(data, key);
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /* Built-in method references that are verified to be native. */
    var Map$1 = getNative(root, 'Map');

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map$1 || ListCache),
        'string': new Hash
      };
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /** Built-in value references. */
    var getPrototype = overArg(Object.getPrototypeOf, Object);

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }

    /**
     * The base implementation of `_.assignIn` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn$1(source), object);
    }

    /** Detect free variable `exports`. */
    var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;

    /** Built-in value references. */
    var Buffer$1 = moduleExports$2 ? root.Buffer : undefined,
        allocUnsafe = Buffer$1 ? Buffer$1.allocUnsafe : undefined;

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /** Used for built-in method references. */
    var objectProto$b = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable$1.call(object, symbol);
      });
    };

    /**
     * Copies own symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own and inherited enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols$1 ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };

    /**
     * Copies own and inherited symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn$1, getSymbolsIn);
    }

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView');

    /* Built-in method references that are verified to be native. */
    var Promise$1 = getNative(root, 'Promise');

    /* Built-in method references that are verified to be native. */
    var Set$1 = getNative(root, 'Set');

    /** `Object#toString` result references. */
    var mapTag$1 = '[object Map]',
        objectTag$1 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag$1 = '[object Set]',
        weakMapTag$1 = '[object WeakMap]';

    var dataViewTag$1 = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map$1),
        promiseCtorString = toSource(Promise$1),
        setCtorString = toSource(Set$1),
        weakMapCtorString = toSource(WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
        (Map$1 && getTag(new Map$1) != mapTag$1) ||
        (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
        (Set$1 && getTag(new Set$1) != setTag$1) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag$1)) {
      getTag = function(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$1;
            case mapCtorString: return mapTag$1;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$1;
            case weakMapCtorString: return weakMapTag$1;
          }
        }
        return result;
      };
    }

    var getTag$1 = getTag;

    /** Used for built-in method references. */
    var objectProto$c = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty$9.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    /** Built-in value references. */
    var Uint8Array$1 = root.Uint8Array;

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /** `Object#toString` result references. */
    var boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        mapTag$2 = '[object Map]',
        numberTag$1 = '[object Number]',
        regexpTag$1 = '[object RegExp]',
        setTag$2 = '[object Set]',
        stringTag$1 = '[object String]',
        symbolTag = '[object Symbol]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$2 = '[object DataView]',
        float32Tag$1 = '[object Float32Array]',
        float64Tag$1 = '[object Float64Array]',
        int8Tag$1 = '[object Int8Array]',
        int16Tag$1 = '[object Int16Array]',
        int32Tag$1 = '[object Int32Array]',
        uint8Tag$1 = '[object Uint8Array]',
        uint8ClampedTag$1 = '[object Uint8ClampedArray]',
        uint16Tag$1 = '[object Uint16Array]',
        uint32Tag$1 = '[object Uint32Array]';

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag$1:
          return cloneArrayBuffer(object);

        case boolTag$1:
        case dateTag$1:
          return new Ctor(+object);

        case dataViewTag$2:
          return cloneDataView(object, isDeep);

        case float32Tag$1: case float64Tag$1:
        case int8Tag$1: case int16Tag$1: case int32Tag$1:
        case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
          return cloneTypedArray(object, isDeep);

        case mapTag$2:
          return new Ctor;

        case numberTag$1:
        case stringTag$1:
          return new Ctor(object);

        case regexpTag$1:
          return cloneRegExp(object);

        case setTag$2:
          return new Ctor;

        case symbolTag:
          return cloneSymbol(object);
      }
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }

    /** `Object#toString` result references. */
    var mapTag$3 = '[object Map]';

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike(value) && getTag$1(value) == mapTag$3;
    }

    /* Node.js helper references. */
    var nodeIsMap = nodeUtil && nodeUtil.isMap;

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

    /** `Object#toString` result references. */
    var setTag$3 = '[object Set]';

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike(value) && getTag$1(value) == setTag$3;
    }

    /* Node.js helper references. */
    var nodeIsSet = nodeUtil && nodeUtil.isSet;

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG = 4;

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        boolTag$2 = '[object Boolean]',
        dateTag$2 = '[object Date]',
        errorTag$1 = '[object Error]',
        funcTag$2 = '[object Function]',
        genTag$1 = '[object GeneratorFunction]',
        mapTag$4 = '[object Map]',
        numberTag$2 = '[object Number]',
        objectTag$2 = '[object Object]',
        regexpTag$2 = '[object RegExp]',
        setTag$4 = '[object Set]',
        stringTag$2 = '[object String]',
        symbolTag$1 = '[object Symbol]',
        weakMapTag$2 = '[object WeakMap]';

    var arrayBufferTag$2 = '[object ArrayBuffer]',
        dataViewTag$3 = '[object DataView]',
        float32Tag$2 = '[object Float32Array]',
        float64Tag$2 = '[object Float64Array]',
        int8Tag$2 = '[object Int8Array]',
        int16Tag$2 = '[object Int16Array]',
        int32Tag$2 = '[object Int32Array]',
        uint8Tag$2 = '[object Uint8Array]',
        uint8ClampedTag$2 = '[object Uint8ClampedArray]',
        uint16Tag$2 = '[object Uint16Array]',
        uint32Tag$2 = '[object Uint32Array]';

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
    cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] =
    cloneableTags[boolTag$2] = cloneableTags[dateTag$2] =
    cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
    cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
    cloneableTags[int32Tag$2] = cloneableTags[mapTag$4] =
    cloneableTags[numberTag$2] = cloneableTags[objectTag$2] =
    cloneableTags[regexpTag$2] = cloneableTags[setTag$4] =
    cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] =
    cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
    cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
    cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
    cloneableTags[weakMapTag$2] = false;

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Deep clone
     *  2 - Flatten inherited properties
     *  4 - Clone symbols
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG;

      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag$1(value),
            isFunc = tag == funcTag$2 || tag == genTag$1;

        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? copySymbolsIn(value, baseAssignIn(result, value))
              : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key) {
          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
      }

      var keysFunc = isFull
        ? (isFlat ? getAllKeysIn : getAllKeys)
        : (isFlat ? keysIn : keys);

      var props = isArr ? undefined : keysFunc(value);
      arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG$1 = 1,
        CLONE_SYMBOLS_FLAG$1 = 4;

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return baseClone(value, CLONE_DEEP_FLAG$1 | CLONE_SYMBOLS_FLAG$1);
    }

    // Svelte
    const defaults = [];
    const logicStore = writable(defaults);
    const customLogicStore = {
        subscribe: logicStore.subscribe,
        add: (newLogic) => {
            logicStore.update((items) => [...items, newLogic]);
        },
        modify: (data) => {
            logicStore.update((items) => items.map((item) => (item.id === data.id ? Object.assign(Object.assign({}, item), data) : item)));
        },
        remove: (id) => {
            logicStore.update((items) => items.filter((item) => item.id !== id));
        },
    };
    const logicParams = writable({
        submitHiddenInputs: false,
        checkConditionsOnLoad: true,
    });
    const logicExport = derived([logicStore, logicParams], ([$logicStore, $logicParams]) => {
        const newStore = cloneDeep($logicStore);
        const { submitHiddenInputs, checkConditionsOnLoad } = $logicParams;
        newStore.forEach((logic) => {
            delete logic.id;
            logic.conditions.forEach((condition) => {
                if (condition.type === 'radios') {
                    condition.selector = `input[name="${condition.selector}"]:checked`;
                }
                else {
                    if (!condition.selector.startsWith('#'))
                        condition.selector = `#${condition.selector}`;
                }
                if (condition.operator === 'checked') {
                    condition.value = 'true';
                    condition.operator = 'equal';
                }
                if (condition.operator === 'not-checked') {
                    condition.value = 'false';
                    condition.operator = 'equal';
                }
                delete condition.type;
            });
            logic.actions.forEach((action) => {
                action.selector = `#${action.selector}`;
            });
        });
        return {
            logicList: newStore,
            submitHiddenInputs,
            checkConditionsOnLoad,
        };
    });

    /* src\icons\edit-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$G(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 512 512" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M493.25 56.26L455.74 18.75C443.25 6.25 426.87 0 410.49 0C394.11 0\r\n    377.73 6.25 365.23 18.74L12.85 371.12L0.150022 485.34C-1.44998 499.72\r\n    9.88002 512 23.95 512C24.84 512 25.73 511.95 26.64 511.85L140.78\r\n    499.24L493.26 146.76C518.25 121.77 518.25 81.25 493.25\r\n    56.26V56.26ZM126.09 468.68L33.06 478.99L43.42 385.82L307.31\r\n    121.93L390.08 204.7L126.09 468.68V468.68ZM470.63 124.14L412.7\r\n    182.07L329.93 99.3L387.86 41.37C393.9 35.33 401.94 32 410.49 32C419.04\r\n    32 427.07 35.33 433.12 41.37L470.63 78.88C483.1 91.36 483.1 111.66\r\n    470.63 124.14Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 512 512" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$G($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class EditIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});
    	}
    }

    /* src\icons\trash-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$H(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 512 512" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M328 432H344C346.122 432 348.157 431.157 349.657 429.657C351.157\r\n    428.157 352 426.122 352 424V152C352 149.878 351.157 147.843 349.657\r\n    146.343C348.157 144.843 346.122 144 344 144H328C325.878 144 323.843\r\n    144.843 322.343 146.343C320.843 147.843 320 149.878 320 152V424C320\r\n    426.122 320.843 428.157 322.343 429.657C323.843 431.157 325.878 432\r\n    328 432ZM168 432H184C186.122 432 188.157 431.157 189.657\r\n    429.657C191.157 428.157 192 426.122 192 424V152C192 149.878 191.157\r\n    147.843 189.657 146.343C188.157 144.843 186.122 144 184\r\n    144H168C165.878 144 163.843 144.843 162.343 146.343C160.843 147.843\r\n    160 149.878 160 152V424C160 426.122 160.843 428.157 162.343\r\n    429.657C163.843 431.157 165.878 432 168 432ZM472 64H368L334.4\r\n    19.2C329.929 13.2386 324.131 8.40003 317.466 5.06749C310.801 1.73496\r\n    303.452 0 296 0L216 0C208.548 0 201.199 1.73496 194.534\r\n    5.06749C187.869 8.40003 182.071 13.2386 177.6 19.2L144 64H40C37.8783\r\n    64 35.8434 64.8429 34.3431 66.3431C32.8429 67.8434 32 69.8783 32\r\n    72V88C32 90.1217 32.8429 92.1566 34.3431 93.6569C35.8434 95.1571\r\n    37.8783 96 40 96H64V464C64 476.73 69.0571 488.939 78.0589\r\n    497.941C87.0606 506.943 99.2696 512 112 512H400C412.73 512 424.939\r\n    506.943 433.941 497.941C442.943 488.939 448 476.73 448\r\n    464V96H472C474.122 96 476.157 95.1571 477.657 93.6569C479.157 92.1566\r\n    480 90.1217 480 88V72C480 69.8783 479.157 67.8434 477.657\r\n    66.3431C476.157 64.8429 474.122 64 472 64ZM203.2 38.4C204.696 36.4186\r\n    206.629 34.8099 208.85 33.6996C211.07 32.5894 213.517 32.0077 216\r\n    32H296C298.483 32.0077 300.93 32.5894 303.15 33.6996C305.371 34.8099\r\n    307.304 36.4186 308.8 38.4L328 64H184L203.2 38.4ZM416 464C416 468.243\r\n    414.314 472.313 411.314 475.314C408.313 478.314 404.243 480 400\r\n    480H112C107.757 480 103.687 478.314 100.686 475.314C97.6857 472.313 96\r\n    468.243 96 464V96H416V464ZM248 432H264C266.122 432 268.157 431.157\r\n    269.657 429.657C271.157 428.157 272 426.122 272 424V152C272 149.878\r\n    271.157 147.843 269.657 146.343C268.157 144.843 266.122 144 264\r\n    144H248C245.878 144 243.843 144.843 242.343 146.343C240.843 147.843\r\n    240 149.878 240 152V424C240 426.122 240.843 428.157 242.343\r\n    429.657C243.843 431.157 245.878 432 248 432Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 512 512" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$H($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class TrashIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});
    	}
    }

    /* src\pages\logic\components\LogicBlock.svelte generated by Svelte v3.24.1 */
    const file$m = "src\\pages\\logic\\components\\LogicBlock.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (51:6) {#if condition.value}
    function create_if_block$8(ctx) {
    	let t_value = /*condition*/ ctx[11].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*conditions*/ 2 && t_value !== (t_value = /*condition*/ ctx[11].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(51:6) {#if condition.value}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#each conditions as condition, index}
    function create_each_block_1$1(ctx) {
    	let div;
    	let strong;
    	let t0_value = (/*index*/ ctx[4] === 0 ? "If" : /*operator*/ ctx[2]) + "";
    	let t0;
    	let t1;
    	let t2_value = /*condition*/ ctx[11].selector + "";
    	let t2;
    	let t3;
    	let span;
    	let t4_value = convertOperator(/*condition*/ ctx[11].operator) + "";
    	let t4;
    	let t5;
    	let t6;
    	let if_block = /*condition*/ ctx[11].value && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			span = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			attr_dev(strong, "class", "capitalize");
    			add_location(strong, file$m, 47, 6, 1459);
    			attr_dev(span, "class", "sea-green");
    			add_location(span, file$m, 49, 6, 1562);
    			attr_dev(div, "class", "mb-2");
    			add_location(div, file$m, 46, 4, 1433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, strong);
    			append_dev(strong, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, span);
    			append_dev(span, t4);
    			append_dev(div, t5);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*operator*/ 4 && t0_value !== (t0_value = (/*index*/ ctx[4] === 0 ? "If" : /*operator*/ ctx[2]) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*conditions*/ 2 && t2_value !== (t2_value = /*condition*/ ctx[11].selector + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*conditions*/ 2 && t4_value !== (t4_value = convertOperator(/*condition*/ ctx[11].operator) + "")) set_data_dev(t4, t4_value);

    			if (/*condition*/ ctx[11].value) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(46:2) {#each conditions as condition, index}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#each actions as action, index}
    function create_each_block$5(ctx) {
    	let div;
    	let span;
    	let t0_value = /*action*/ ctx[9].action + "";
    	let t0;
    	let t1;
    	let t2_value = /*action*/ ctx[9].selector + "";
    	let t2;
    	let t3;
    	let html_tag;

    	let raw_value = (/*action*/ ctx[9].clear
    	? `<strong>and</strong> clear its value`
    	: ``) + "";

    	let t4;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = space();
    			attr_dev(span, "class", "sea-green capitalize");
    			add_location(span, file$m, 60, 6, 1896);
    			html_tag = new HtmlTag(t4);

    			attr_dev(div, "class", div_class_value = /*index*/ ctx[4] < /*actions*/ ctx[3].length - 1
    			? "mb-2"
    			: "");

    			add_location(div, file$m, 59, 4, 1834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			html_tag.m(raw_value, div);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*actions*/ 8 && t0_value !== (t0_value = /*action*/ ctx[9].action + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*actions*/ 8 && t2_value !== (t2_value = /*action*/ ctx[9].selector + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*actions*/ 8 && raw_value !== (raw_value = (/*action*/ ctx[9].clear
    			? `<strong>and</strong> clear its value`
    			: ``) + "")) html_tag.p(raw_value);

    			if (dirty & /*actions*/ 8 && div_class_value !== (div_class_value = /*index*/ ctx[4] < /*actions*/ ctx[3].length - 1
    			? "mb-2"
    			: "")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(59:2) {#each actions as action, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$I(ctx) {
    	let div0;
    	let t0_value = /*index*/ ctx[4] + 1 + "";
    	let t0;
    	let t1;
    	let div2;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let div3;
    	let button0;
    	let editicon;
    	let t5;
    	let button1;
    	let trashicon;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*conditions*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*actions*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	editicon = new EditIcon({ $$inline: true });
    	trashicon = new TrashIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div3 = element("div");
    			button0 = element("button");
    			create_component(editicon.$$.fragment);
    			t5 = space();
    			button1 = element("button");
    			create_component(trashicon.$$.fragment);
    			attr_dev(div0, "class", "logic-number");
    			add_location(div0, file$m, 39, 0, 1268);
    			attr_dev(div1, "class", "logic-block-divider my-3");
    			add_location(div1, file$m, 55, 2, 1730);
    			attr_dev(div2, "class", "logic-info");
    			add_location(div2, file$m, 42, 0, 1336);
    			attr_dev(button0, "class", "logic-control edit");
    			add_location(button0, file$m, 71, 2, 2163);
    			attr_dev(button1, "class", "logic-control delete");
    			add_location(button1, file$m, 76, 2, 2285);
    			attr_dev(div3, "class", "logic-controls");
    			add_location(div3, file$m, 68, 0, 2112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button0);
    			mount_component(editicon, button0, null);
    			append_dev(div3, t5);
    			append_dev(div3, button1);
    			mount_component(trashicon, button1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*index*/ 16) && t0_value !== (t0_value = /*index*/ ctx[4] + 1 + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*conditions, convertOperator, operator*/ 6) {
    				each_value_1 = /*conditions*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*actions*/ 8) {
    				each_value = /*actions*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editicon.$$.fragment, local);
    			transition_in(trashicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editicon.$$.fragment, local);
    			transition_out(trashicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			destroy_component(editicon);
    			destroy_component(trashicon);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function convertOperator(operator) {
    	if (operator === "equal") return "is equal to";
    	if (operator === "not-equal") return "is not equal to";
    	if (operator === "contain") return "contains";
    	if (operator === "not-contain") return "does not contain";
    	if (operator === "greater") return "is greater than";
    	if (operator === "greater-equal") return "is greater or equal to";
    	if (operator === "less") return "is less than";
    	if (operator === "less-equal") return "is less or equal to";
    	if (operator === "empty") return "is empty";
    	if (operator === "filled") return "is filled";
    	if (operator === "checked") return "is checked";
    	if (operator === "not-checked") return "is not checked";
    }

    function instance$I($$self, $$props, $$invalidate) {
    	

    	let { index } = $$props,
    		{ id } = $$props,
    		{ conditions } = $$props,
    		{ operator } = $$props,
    		{ actions } = $$props;

    	// Functions
    	const dispatch = createEventDispatcher();

    	const { editLogic } = getContext("logic");
    	const writable_props = ["index", "id", "conditions", "operator", "actions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LogicBlock> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LogicBlock", $$slots, []);
    	const click_handler = () => editLogic(id);
    	const click_handler_1 = () => dispatch("delete", id);

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("conditions" in $$props) $$invalidate(1, conditions = $$props.conditions);
    		if ("operator" in $$props) $$invalidate(2, operator = $$props.operator);
    		if ("actions" in $$props) $$invalidate(3, actions = $$props.actions);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		index,
    		id,
    		conditions,
    		operator,
    		actions,
    		EditIcon,
    		TrashIcon,
    		dispatch,
    		editLogic,
    		convertOperator
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("conditions" in $$props) $$invalidate(1, conditions = $$props.conditions);
    		if ("operator" in $$props) $$invalidate(2, operator = $$props.operator);
    		if ("actions" in $$props) $$invalidate(3, actions = $$props.actions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		id,
    		conditions,
    		operator,
    		actions,
    		index,
    		dispatch,
    		editLogic,
    		click_handler,
    		click_handler_1
    	];
    }

    class LogicBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$I, create_fragment$I, safe_not_equal, {
    			index: 4,
    			id: 0,
    			conditions: 1,
    			operator: 2,
    			actions: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogicBlock",
    			options,
    			id: create_fragment$I.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<LogicBlock> was created without expected prop 'index'");
    		}

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<LogicBlock> was created without expected prop 'id'");
    		}

    		if (/*conditions*/ ctx[1] === undefined && !("conditions" in props)) {
    			console.warn("<LogicBlock> was created without expected prop 'conditions'");
    		}

    		if (/*operator*/ ctx[2] === undefined && !("operator" in props)) {
    			console.warn("<LogicBlock> was created without expected prop 'operator'");
    		}

    		if (/*actions*/ ctx[3] === undefined && !("actions" in props)) {
    			console.warn("<LogicBlock> was created without expected prop 'actions'");
    		}
    	}

    	get index() {
    		throw new Error("<LogicBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<LogicBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<LogicBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<LogicBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get conditions() {
    		throw new Error("<LogicBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set conditions(value) {
    		throw new Error("<LogicBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get operator() {
    		throw new Error("<LogicBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set operator(value) {
    		throw new Error("<LogicBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actions() {
    		throw new Error("<LogicBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actions(value) {
    		throw new Error("<LogicBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\logic\components\LogicGlobal.svelte generated by Svelte v3.24.1 */
    const file$n = "src\\pages\\logic\\components\\LogicGlobal.svelte";

    function create_fragment$J(ctx) {
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let checkbox0;
    	let updating_checked;
    	let t2;
    	let minibutton0;
    	let t3;
    	let div2;
    	let checkbox1;
    	let updating_checked_1;
    	let t4;
    	let minibutton1;
    	let current;

    	function checkbox0_checked_binding(value) {
    		/*checkbox0_checked_binding*/ ctx[2].call(null, value);
    	}

    	let checkbox0_props = {
    		id: "submit-hidden",
    		name: "Submit Hidden",
    		label: "Submit hidden inputs",
    		extraClass: "mr-3"
    	};

    	if (/*$logicParams*/ ctx[0].submitHiddenInputs !== void 0) {
    		checkbox0_props.checked = /*$logicParams*/ ctx[0].submitHiddenInputs;
    	}

    	checkbox0 = new Checkbox({ props: checkbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox0, "checked", checkbox0_checked_binding));

    	minibutton0 = new MiniButton({
    			props: { action: "info" },
    			$$inline: true
    		});

    	minibutton0.$on("info", /*info_handler*/ ctx[3]);

    	function checkbox1_checked_binding(value) {
    		/*checkbox1_checked_binding*/ ctx[4].call(null, value);
    	}

    	let checkbox1_props = {
    		id: "check-conditions-on-load",
    		name: "Check Conditions On Load",
    		label: "Check conditions on load",
    		extraClass: "mr-3"
    	};

    	if (/*$logicParams*/ ctx[0].checkConditionsOnLoad !== void 0) {
    		checkbox1_props.checked = /*$logicParams*/ ctx[0].checkConditionsOnLoad;
    	}

    	checkbox1 = new Checkbox({ props: checkbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox1, "checked", checkbox1_checked_binding));

    	minibutton1 = new MiniButton({
    			props: { action: "info" },
    			$$inline: true
    		});

    	minibutton1.$on("info", /*info_handler_1*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Global Options:";
    			t1 = space();
    			div1 = element("div");
    			create_component(checkbox0.$$.fragment);
    			t2 = space();
    			create_component(minibutton0.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			create_component(checkbox1.$$.fragment);
    			t4 = space();
    			create_component(minibutton1.$$.fragment);
    			attr_dev(div0, "class", "bold mb-3");
    			add_location(div0, file$n, 9, 2, 300);
    			attr_dev(div1, "class", "hflex-c-s mb-2");
    			add_location(div1, file$n, 12, 2, 383);
    			attr_dev(div2, "class", "hflex-c-s");
    			add_location(div2, file$n, 23, 2, 733);
    			add_location(div3, file$n, 8, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			mount_component(checkbox0, div1, null);
    			append_dev(div1, t2);
    			mount_component(minibutton0, div1, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			mount_component(checkbox1, div2, null);
    			append_dev(div2, t4);
    			mount_component(minibutton1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const checkbox0_changes = {};

    			if (!updating_checked && dirty & /*$logicParams*/ 1) {
    				updating_checked = true;
    				checkbox0_changes.checked = /*$logicParams*/ ctx[0].submitHiddenInputs;
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox0.$set(checkbox0_changes);
    			const checkbox1_changes = {};

    			if (!updating_checked_1 && dirty & /*$logicParams*/ 1) {
    				updating_checked_1 = true;
    				checkbox1_changes.checked = /*$logicParams*/ ctx[0].checkConditionsOnLoad;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			checkbox1.$set(checkbox1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);
    			transition_in(minibutton0.$$.fragment, local);
    			transition_in(checkbox1.$$.fragment, local);
    			transition_in(minibutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(minibutton0.$$.fragment, local);
    			transition_out(checkbox1.$$.fragment, local);
    			transition_out(minibutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(checkbox0);
    			destroy_component(minibutton0);
    			destroy_component(checkbox1);
    			destroy_component(minibutton1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$J($$self, $$props, $$invalidate) {
    	let $logicParams;
    	validate_store(logicParams, "logicParams");
    	component_subscribe($$self, logicParams, $$value => $$invalidate(0, $logicParams = $$value));
    	const { openModal } = getContext("logic");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LogicGlobal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LogicGlobal", $$slots, []);

    	function checkbox0_checked_binding(value) {
    		$logicParams.submitHiddenInputs = value;
    		logicParams.set($logicParams);
    	}

    	const info_handler = () => openModal("submitHiddenInputs");

    	function checkbox1_checked_binding(value) {
    		$logicParams.checkConditionsOnLoad = value;
    		logicParams.set($logicParams);
    	}

    	const info_handler_1 = () => openModal("checkConditionsOnLoad");

    	$$self.$capture_state = () => ({
    		getContext,
    		logicParams,
    		Checkbox,
    		MiniButton,
    		openModal,
    		$logicParams
    	});

    	return [
    		$logicParams,
    		openModal,
    		checkbox0_checked_binding,
    		info_handler,
    		checkbox1_checked_binding,
    		info_handler_1
    	];
    }

    class LogicGlobal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogicGlobal",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }

    /* src\pages\logic\components\LogicList.svelte generated by Svelte v3.24.1 */
    const file$o = "src\\pages\\logic\\components\\LogicList.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (35:4) {#each $logicStore as logic, index (logic.id)}
    function create_each_block$6(key_1, ctx) {
    	let div;
    	let logicblock;
    	let t;
    	let div_transition;
    	let current;
    	const logicblock_spread_levels = [/*logic*/ ctx[4], { index: /*index*/ ctx[6] }];
    	let logicblock_props = {};

    	for (let i = 0; i < logicblock_spread_levels.length; i += 1) {
    		logicblock_props = assign(logicblock_props, logicblock_spread_levels[i]);
    	}

    	logicblock = new LogicBlock({ props: logicblock_props, $$inline: true });
    	logicblock.$on("delete", /*deleteLogic*/ ctx[1]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(logicblock.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "logic-block mb-4");
    			add_location(div, file$o, 35, 6, 981);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(logicblock, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const logicblock_changes = (dirty & /*$logicStore*/ 1)
    			? get_spread_update(logicblock_spread_levels, [get_spread_object(/*logic*/ ctx[4]), { index: /*index*/ ctx[6] }])
    			: {};

    			logicblock.$set(logicblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logicblock.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logicblock.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(logicblock);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(35:4) {#each $logicStore as logic, index (logic.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$K(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let div1;
    	let h2;
    	let t2;
    	let controlbutton;
    	let t3;
    	let logicglobal;
    	let t4;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	controlbutton = new ControlButton({ $$inline: true });
    	controlbutton.$on("click", /*click_handler*/ ctx[3]);
    	logicglobal = new LogicGlobal({ $$inline: true });
    	let each_value = /*$logicStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*logic*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$6, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Add New";
    			t2 = space();
    			create_component(controlbutton.$$.fragment);
    			t3 = space();
    			create_component(logicglobal.$$.fragment);
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "logic-block-divider my-12");
    			add_location(div0, file$o, 16, 2, 515);
    			attr_dev(h2, "class", "mb-0 mr-4");
    			add_location(h2, file$o, 25, 8, 711);
    			attr_dev(div1, "class", "hflex-c-s");
    			add_location(div1, file$o, 24, 6, 678);
    			attr_dev(div2, "class", "hflex-c-sb mb-8");
    			add_location(div2, file$o, 21, 4, 615);
    			attr_dev(div3, "class", "vflex-str-s");
    			add_location(div3, file$o, 19, 2, 582);
    			attr_dev(div4, "class", "container max-w-2xl");
    			add_location(div4, file$o, 13, 0, 456);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			mount_component(controlbutton, div1, null);
    			append_dev(div2, t3);
    			mount_component(logicglobal, div2, null);
    			append_dev(div3, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$logicStore, deleteLogic*/ 3) {
    				const each_value = /*$logicStore*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div3, outro_and_destroy_block, create_each_block$6, null, get_each_context$6);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlbutton.$$.fragment, local);
    			transition_in(logicglobal.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlbutton.$$.fragment, local);
    			transition_out(logicglobal.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(controlbutton);
    			destroy_component(logicglobal);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$K.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$K($$self, $$props, $$invalidate) {
    	let $logicStore;
    	validate_store(customLogicStore, "logicStore");
    	component_subscribe($$self, customLogicStore, $$value => $$invalidate(0, $logicStore = $$value));

    	const deleteLogic = e => {
    		customLogicStore.remove(e.detail);
    	};

    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LogicList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LogicList", $$slots, []);
    	const click_handler = () => dispatch("newLogic");

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		logicStore: customLogicStore,
    		LogicBlock,
    		LogicGlobal,
    		ControlButton,
    		deleteLogic,
    		dispatch,
    		$logicStore
    	});

    	return [$logicStore, deleteLogic, dispatch, click_handler];
    }

    class LogicList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogicList",
    			options,
    			id: create_fragment$K.name
    		});
    	}
    }

    /* src\pages\logic\components\ConditionsBlock.svelte generated by Svelte v3.24.1 */
    const file$p = "src\\pages\\logic\\components\\ConditionsBlock.svelte";

    // (206:4) {#if condition.type !== 'checkbox' && condition.operator !== 'empty' && condition.operator !== 'filled'}
    function create_if_block_1$5(ctx) {
    	let div;
    	let label;
    	let t0;
    	let label_for_value;
    	let t1;
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding_1(value) {
    		/*input_value_binding_1*/ ctx[16].call(null, value);
    	}

    	let input_props = {
    		type: /*condition*/ ctx[0].type === "number"
    		? "number"
    		: "text",
    		name: "Condition Value",
    		placeholder: "Your Value",
    		id: `value-${/*index*/ ctx[1]}`,
    		extraClass: "flex-auto"
    	};

    	if (/*value*/ ctx[5] !== void 0) {
    		input_props.value = /*value*/ ctx[5];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_1));
    	input.$on("input", /*input_handler_3*/ ctx[17]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text("the value");
    			t1 = space();
    			create_component(input.$$.fragment);
    			attr_dev(label, "for", label_for_value = `value-${/*index*/ ctx[1]}`);
    			attr_dev(label, "class", "mr-2");
    			add_location(label, file$p, 207, 8, 5487);
    			attr_dev(div, "class", "hflex-c-s");
    			add_location(div, file$p, 206, 6, 5454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			mount_component(input, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*index*/ 2 && label_for_value !== (label_for_value = `value-${/*index*/ ctx[1]}`)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			const input_changes = {};

    			if (dirty & /*condition*/ 1) input_changes.type = /*condition*/ ctx[0].type === "number"
    			? "number"
    			: "text";

    			if (dirty & /*index*/ 2) input_changes.id = `value-${/*index*/ ctx[1]}`;

    			if (!updating_value && dirty & /*value*/ 32) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[5];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(206:4) {#if condition.type !== 'checkbox' && condition.operator !== 'empty' && condition.operator !== 'filled'}",
    		ctx
    	});

    	return block;
    }

    // (232:2) {#if index !== 0}
    function create_if_block$9(ctx) {
    	let controlbutton;
    	let current;

    	controlbutton = new ControlButton({
    			props: { action: "delete", extraClass: "ml-4" },
    			$$inline: true
    		});

    	controlbutton.$on("click", /*click_handler_1*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(controlbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(controlbutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(controlbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(232:2) {#if index !== 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$L(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let label0;
    	let t0;
    	let label0_for_value;
    	let t1;
    	let select0;
    	let updating_value;
    	let t2;
    	let div1;
    	let label1;

    	let t3_value = (/*condition*/ ctx[0].type === "radios"
    	? "which Group Name is"
    	: "which ID is") + "";

    	let t3;
    	let label1_for_value;
    	let t4;
    	let input;
    	let updating_value_1;
    	let t5;
    	let div2;
    	let label2;
    	let t6;
    	let label2_for_value;
    	let t7;
    	let select1;
    	let updating_value_2;
    	let t8;
    	let t9;
    	let div5;
    	let controlbutton;
    	let t10;
    	let current;

    	function select0_value_binding(value) {
    		/*select0_value_binding*/ ctx[10].call(null, value);
    	}

    	let select0_props = {
    		id: `type-${/*index*/ ctx[1]}`,
    		name: "Condition Origin Type",
    		extraClass: "flex-auto",
    		options: /*types*/ ctx[7]
    	};

    	if (/*type*/ ctx[2] !== void 0) {
    		select0_props.value = /*type*/ ctx[2];
    	}

    	select0 = new Select({ props: select0_props, $$inline: true });
    	binding_callbacks.push(() => bind(select0, "value", select0_value_binding));
    	select0.$on("input", /*deleteOperator*/ ctx[9]);
    	select0.$on("input", /*input_handler*/ ctx[11]);

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[12].call(null, value);
    	}

    	let input_props = {
    		name: "Condition Selector",
    		placeholder: "your-element",
    		id: `selector-${/*index*/ ctx[1]}`,
    		extraClass: "flex-auto"
    	};

    	if (/*selector*/ ctx[3] !== void 0) {
    		input_props.value = /*selector*/ ctx[3];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));
    	input.$on("input", /*input_handler_1*/ ctx[13]);

    	function select1_value_binding(value) {
    		/*select1_value_binding*/ ctx[14].call(null, value);
    	}

    	let select1_props = {
    		id: `operator-${/*index*/ ctx[1]}`,
    		name: "Condition Operator",
    		options: /*filteredOperators*/ ctx[6],
    		extraClass: "flex-auto"
    	};

    	if (/*operator*/ ctx[4] !== void 0) {
    		select1_props.value = /*operator*/ ctx[4];
    	}

    	select1 = new Select({ props: select1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select1, "value", select1_value_binding));
    	select1.$on("input", /*input_handler_2*/ ctx[15]);
    	let if_block0 = /*condition*/ ctx[0].type !== "checkbox" && /*condition*/ ctx[0].operator !== "empty" && /*condition*/ ctx[0].operator !== "filled" && create_if_block_1$5(ctx);

    	controlbutton = new ControlButton({
    			props: { extraClass: "ml-4 mb-4" },
    			$$inline: true
    		});

    	controlbutton.$on("click", /*click_handler*/ ctx[18]);
    	let if_block1 = /*index*/ ctx[1] !== 0 && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			t0 = text("The");
    			t1 = space();
    			create_component(select0.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(input.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			label2 = element("label");
    			t6 = text("must");
    			t7 = space();
    			create_component(select1.$$.fragment);
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			div5 = element("div");
    			create_component(controlbutton.$$.fragment);
    			t10 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(label0, "for", label0_for_value = `type-${/*index*/ ctx[1]}`);
    			attr_dev(label0, "class", "mr-2");
    			add_location(label0, file$p, 164, 6, 4236);
    			attr_dev(div0, "class", "hflex-c-s");
    			add_location(div0, file$p, 163, 4, 4205);
    			attr_dev(label1, "for", label1_for_value = `selector-${/*index*/ ctx[1]}`);
    			attr_dev(label1, "class", "mr-2");
    			add_location(label1, file$p, 177, 6, 4592);
    			attr_dev(div1, "class", "hflex-c-s");
    			add_location(div1, file$p, 176, 4, 4561);
    			attr_dev(label2, "for", label2_for_value = `operator-${/*index*/ ctx[1]}`);
    			attr_dev(label2, "class", "mr-2");
    			add_location(label2, file$p, 193, 6, 5031);
    			attr_dev(div2, "class", "hflex-c-s");
    			add_location(div2, file$p, 192, 4, 5000);
    			attr_dev(div3, "class", "condition-grid");
    			add_location(div3, file$p, 160, 2, 4143);
    			attr_dev(div4, "class", "logic-block");
    			add_location(div4, file$p, 159, 0, 4114);
    			add_location(div5, file$p, 224, 0, 5891);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t0);
    			append_dev(div0, t1);
    			mount_component(select0, div0, null);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(label1, t3);
    			append_dev(div1, t4);
    			mount_component(input, div1, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, label2);
    			append_dev(label2, t6);
    			append_dev(div2, t7);
    			mount_component(select1, div2, null);
    			append_dev(div3, t8);
    			if (if_block0) if_block0.m(div3, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div5, anchor);
    			mount_component(controlbutton, div5, null);
    			append_dev(div5, t10);
    			if (if_block1) if_block1.m(div5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*index*/ 2 && label0_for_value !== (label0_for_value = `type-${/*index*/ ctx[1]}`)) {
    				attr_dev(label0, "for", label0_for_value);
    			}

    			const select0_changes = {};
    			if (dirty & /*index*/ 2) select0_changes.id = `type-${/*index*/ ctx[1]}`;

    			if (!updating_value && dirty & /*type*/ 4) {
    				updating_value = true;
    				select0_changes.value = /*type*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			select0.$set(select0_changes);

    			if ((!current || dirty & /*condition*/ 1) && t3_value !== (t3_value = (/*condition*/ ctx[0].type === "radios"
    			? "which Group Name is"
    			: "which ID is") + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*index*/ 2 && label1_for_value !== (label1_for_value = `selector-${/*index*/ ctx[1]}`)) {
    				attr_dev(label1, "for", label1_for_value);
    			}

    			const input_changes = {};
    			if (dirty & /*index*/ 2) input_changes.id = `selector-${/*index*/ ctx[1]}`;

    			if (!updating_value_1 && dirty & /*selector*/ 8) {
    				updating_value_1 = true;
    				input_changes.value = /*selector*/ ctx[3];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input.$set(input_changes);

    			if (!current || dirty & /*index*/ 2 && label2_for_value !== (label2_for_value = `operator-${/*index*/ ctx[1]}`)) {
    				attr_dev(label2, "for", label2_for_value);
    			}

    			const select1_changes = {};
    			if (dirty & /*index*/ 2) select1_changes.id = `operator-${/*index*/ ctx[1]}`;
    			if (dirty & /*filteredOperators*/ 64) select1_changes.options = /*filteredOperators*/ ctx[6];

    			if (!updating_value_2 && dirty & /*operator*/ 16) {
    				updating_value_2 = true;
    				select1_changes.value = /*operator*/ ctx[4];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			select1.$set(select1_changes);

    			if (/*condition*/ ctx[0].type !== "checkbox" && /*condition*/ ctx[0].operator !== "empty" && /*condition*/ ctx[0].operator !== "filled") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*condition*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*index*/ ctx[1] !== 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*index*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$9(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select0.$$.fragment, local);
    			transition_in(input.$$.fragment, local);
    			transition_in(select1.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(controlbutton.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select0.$$.fragment, local);
    			transition_out(input.$$.fragment, local);
    			transition_out(select1.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(controlbutton.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(select0);
    			destroy_component(input);
    			destroy_component(select1);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div5);
    			destroy_component(controlbutton);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$L.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$L($$self, $$props, $$invalidate) {
    	
    	let { condition } = $$props, { index } = $$props;

    	// Variables
    	const types = [
    		{
    			name: "Plain / Textarea Field",
    			value: "text"
    		},
    		{ name: "Email Field", value: "email" },
    		{
    			name: "Password Field",
    			value: "password"
    		},
    		{ name: "Phone Field", value: "phone" },
    		{ name: "Number Field", value: "number" },
    		{ name: "Select Field", value: "select" },
    		{ name: "Checkbox", value: "checkbox" },
    		{ name: "Radio Group", value: "radios" }
    	];

    	const operators = [
    		{
    			name: "-- Select Operator --",
    			value: "",
    			compatibleTypes: [
    				"text",
    				"email",
    				"password",
    				"phone",
    				"number",
    				"select",
    				"radios",
    				"number",
    				"checkbox"
    			],
    			disabled: true
    		},
    		{
    			name: "Be Equal To",
    			value: "equal",
    			compatibleTypes: ["text", "email", "password", "phone", "number", "select", "radios"]
    		},
    		{
    			name: "Not Be Equal To",
    			value: "not-equal",
    			compatibleTypes: ["text", "email", "password", "phone", "number", "select", "radios"]
    		},
    		{
    			name: "Contain",
    			value: "contain",
    			compatibleTypes: ["text", "email", "password", "phone", "number", "select", "radios"]
    		},
    		{
    			name: "Not Contain",
    			value: "not-contain",
    			compatibleTypes: ["text", "email", "password", "phone", "number", "select", "radios"]
    		},
    		{
    			name: "Be Empty",
    			value: "empty",
    			compatibleTypes: ["text", "email", "password", "phone", "number", "select", "radios"]
    		},
    		{
    			name: "Be Filled",
    			value: "filled",
    			compatibleTypes: ["text", "email", "password", "phone", "number", "select", "radios"]
    		},
    		{
    			name: "Be Greater Than",
    			value: "greater",
    			compatibleTypes: ["number"]
    		},
    		{
    			name: "Be Greater or Equal Than",
    			value: "greater-equal",
    			compatibleTypes: ["number"]
    		},
    		{
    			name: "Be Less Than",
    			value: "less",
    			compatibleTypes: ["number"]
    		},
    		{
    			name: "Be Less or Equal Than",
    			value: "less-equal",
    			compatibleTypes: ["number"]
    		},
    		{
    			name: "Be Checked",
    			value: "checked",
    			compatibleTypes: ["checkbox"]
    		},
    		{
    			name: "Not Be Checked",
    			value: "not-checked",
    			compatibleTypes: ["checkbox"]
    		}
    	];

    	let type = condition.type || "text";
    	let selector = condition.selector || "";
    	let operator = condition.operator || "";
    	let value = condition.value || "";

    	// Functions
    	const dispatch = createEventDispatcher();

    	function deleteOperator() {
    		$$invalidate(4, operator = "");
    	}

    	const writable_props = ["condition", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConditionsBlock> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ConditionsBlock", $$slots, []);

    	function select0_value_binding(value) {
    		type = value;
    		$$invalidate(2, type);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function input_value_binding(value) {
    		selector = value;
    		$$invalidate(3, selector);
    	}

    	function input_handler_1(event) {
    		bubble($$self, event);
    	}

    	function select1_value_binding(value) {
    		operator = value;
    		$$invalidate(4, operator);
    	}

    	function input_handler_2(event) {
    		bubble($$self, event);
    	}

    	function input_value_binding_1(value$1) {
    		value = value$1;
    		$$invalidate(5, value);
    	}

    	function input_handler_3(event) {
    		bubble($$self, event);
    	}

    	const click_handler = () => dispatch("addcondition");
    	const click_handler_1 = () => dispatch("removecondition", condition);

    	$$self.$$set = $$props => {
    		if ("condition" in $$props) $$invalidate(0, condition = $$props.condition);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ControlButton,
    		Select,
    		Input,
    		condition,
    		index,
    		types,
    		operators,
    		type,
    		selector,
    		operator,
    		value,
    		dispatch,
    		deleteOperator,
    		filteredOperators
    	});

    	$$self.$inject_state = $$props => {
    		if ("condition" in $$props) $$invalidate(0, condition = $$props.condition);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("selector" in $$props) $$invalidate(3, selector = $$props.selector);
    		if ("operator" in $$props) $$invalidate(4, operator = $$props.operator);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("filteredOperators" in $$props) $$invalidate(6, filteredOperators = $$props.filteredOperators);
    	};

    	let filteredOperators;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 4) {
    			// Reactive
    			 $$invalidate(0, condition.type = type, condition);
    		}

    		if ($$self.$$.dirty & /*selector*/ 8) {
    			 $$invalidate(0, condition.selector = selector, condition);
    		}

    		if ($$self.$$.dirty & /*operator*/ 16) {
    			 $$invalidate(0, condition.operator = operator, condition);
    		}

    		if ($$self.$$.dirty & /*value*/ 32) {
    			 $$invalidate(0, condition.value = value, condition);
    		}

    		if ($$self.$$.dirty & /*operator, condition*/ 17) {
    			// $: if (operator === 'checked') {
    			//   condition.operator = 'equal';
    			//   condition.value = 'true';
    			// }
    			// $: if (operator === 'not-checked') {
    			//   condition.operator = 'equal';
    			//   condition.value = 'false';
    			// }
    			 if (["empty", "filled"].includes(operator)) delete condition.value;
    		}

    		if ($$self.$$.dirty & /*type*/ 4) {
    			 $$invalidate(6, filteredOperators = operators.filter(operator => operator.compatibleTypes.includes(type)));
    		}
    	};

    	return [
    		condition,
    		index,
    		type,
    		selector,
    		operator,
    		value,
    		filteredOperators,
    		types,
    		dispatch,
    		deleteOperator,
    		select0_value_binding,
    		input_handler,
    		input_value_binding,
    		input_handler_1,
    		select1_value_binding,
    		input_handler_2,
    		input_value_binding_1,
    		input_handler_3,
    		click_handler,
    		click_handler_1
    	];
    }

    class ConditionsBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$L, create_fragment$L, safe_not_equal, { condition: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConditionsBlock",
    			options,
    			id: create_fragment$L.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*condition*/ ctx[0] === undefined && !("condition" in props)) {
    			console.warn("<ConditionsBlock> was created without expected prop 'condition'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<ConditionsBlock> was created without expected prop 'index'");
    		}
    	}

    	get condition() {
    		throw new Error("<ConditionsBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<ConditionsBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<ConditionsBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<ConditionsBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\logic\components\ActionsBlock.svelte generated by Svelte v3.24.1 */
    const file$q = "src\\pages\\logic\\components\\ActionsBlock.svelte";

    // (73:2) {#if index !== 0}
    function create_if_block$a(ctx) {
    	let controlbutton;
    	let current;

    	controlbutton = new ControlButton({
    			props: { action: "delete", extraClass: "ml-4" },
    			$$inline: true
    		});

    	controlbutton.$on("click", /*click_handler_1*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(controlbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(controlbutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(controlbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(73:2) {#if index !== 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$M(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let label0;
    	let t0;
    	let label0_for_value;
    	let t1;
    	let select;
    	let updating_value;
    	let t2;
    	let div1;
    	let label1;
    	let t3;
    	let label1_for_value;
    	let t4;
    	let input;
    	let updating_value_1;
    	let t5;
    	let checkbox;
    	let updating_checked;
    	let t6;
    	let div4;
    	let controlbutton;
    	let t7;
    	let current;

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[4].call(null, value);
    	}

    	let select_props = {
    		id: `action-${/*index*/ ctx[1]}`,
    		name: "Action",
    		options: /*actionOptions*/ ctx[2],
    		extraClass: "flex-auto"
    	};

    	if (/*action*/ ctx[0].action !== void 0) {
    		select_props.value = /*action*/ ctx[0].action;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding));
    	select.$on("input", /*input_handler*/ ctx[5]);

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[6].call(null, value);
    	}

    	let input_props = {
    		name: "Action Selector",
    		placeholder: "your-target",
    		id: `action-selector-${/*index*/ ctx[1]}`,
    		extraClass: "flex-auto"
    	};

    	if (/*action*/ ctx[0].selector !== void 0) {
    		input_props.value = /*action*/ ctx[0].selector;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));
    	input.$on("input", /*input_handler_1*/ ctx[7]);

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[8].call(null, value);
    	}

    	let checkbox_props = {
    		id: `clear-${/*index*/ ctx[1]}`,
    		name: "Clear Action Target",
    		label: "And clear its value"
    	};

    	if (/*action*/ ctx[0].clear !== void 0) {
    		checkbox_props.checked = /*action*/ ctx[0].clear;
    	}

    	checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, "checked", checkbox_checked_binding));

    	controlbutton = new ControlButton({
    			props: { extraClass: "ml-4 mb-4" },
    			$$inline: true
    		});

    	controlbutton.$on("click", /*click_handler*/ ctx[9]);
    	let if_block = /*index*/ ctx[1] !== 0 && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			t0 = text("Trigger");
    			t1 = space();
    			create_component(select.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t3 = text("on the element with an ID of");
    			t4 = space();
    			create_component(input.$$.fragment);
    			t5 = space();
    			create_component(checkbox.$$.fragment);
    			t6 = space();
    			div4 = element("div");
    			create_component(controlbutton.$$.fragment);
    			t7 = space();
    			if (if_block) if_block.c();
    			attr_dev(label0, "for", label0_for_value = `action-${/*index*/ ctx[1]}`);
    			attr_dev(label0, "class", "mr-2");
    			add_location(label0, file$q, 29, 6, 902);
    			attr_dev(div0, "class", "hflex-c-s");
    			add_location(div0, file$q, 27, 4, 869);
    			attr_dev(label1, "for", label1_for_value = `action-selector-${/*index*/ ctx[1]}`);
    			attr_dev(label1, "class", "mr-2");
    			add_location(label1, file$q, 41, 6, 1233);
    			attr_dev(div1, "class", "hflex-c-s");
    			add_location(div1, file$q, 40, 4, 1202);
    			attr_dev(div2, "class", "action-grid");
    			add_location(div2, file$q, 24, 2, 807);
    			attr_dev(div3, "class", "logic-block");
    			add_location(div3, file$q, 23, 0, 778);
    			add_location(div4, file$q, 64, 0, 1794);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t0);
    			append_dev(div0, t1);
    			mount_component(select, div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(label1, t3);
    			append_dev(div1, t4);
    			mount_component(input, div1, null);
    			append_dev(div2, t5);
    			mount_component(checkbox, div2, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(controlbutton, div4, null);
    			append_dev(div4, t7);
    			if (if_block) if_block.m(div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*index*/ 2 && label0_for_value !== (label0_for_value = `action-${/*index*/ ctx[1]}`)) {
    				attr_dev(label0, "for", label0_for_value);
    			}

    			const select_changes = {};
    			if (dirty & /*index*/ 2) select_changes.id = `action-${/*index*/ ctx[1]}`;

    			if (!updating_value && dirty & /*action*/ 1) {
    				updating_value = true;
    				select_changes.value = /*action*/ ctx[0].action;
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);

    			if (!current || dirty & /*index*/ 2 && label1_for_value !== (label1_for_value = `action-selector-${/*index*/ ctx[1]}`)) {
    				attr_dev(label1, "for", label1_for_value);
    			}

    			const input_changes = {};
    			if (dirty & /*index*/ 2) input_changes.id = `action-selector-${/*index*/ ctx[1]}`;

    			if (!updating_value_1 && dirty & /*action*/ 1) {
    				updating_value_1 = true;
    				input_changes.value = /*action*/ ctx[0].selector;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input.$set(input_changes);
    			const checkbox_changes = {};
    			if (dirty & /*index*/ 2) checkbox_changes.id = `clear-${/*index*/ ctx[1]}`;

    			if (!updating_checked && dirty & /*action*/ 1) {
    				updating_checked = true;
    				checkbox_changes.checked = /*action*/ ctx[0].clear;
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);

    			if (/*index*/ ctx[1] !== 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*index*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			transition_in(input.$$.fragment, local);
    			transition_in(checkbox.$$.fragment, local);
    			transition_in(controlbutton.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			transition_out(input.$$.fragment, local);
    			transition_out(checkbox.$$.fragment, local);
    			transition_out(controlbutton.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(select);
    			destroy_component(input);
    			destroy_component(checkbox);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    			destroy_component(controlbutton);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$M.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$M($$self, $$props, $$invalidate) {
    	
    	let { action } = $$props, { index } = $$props;
    	const test = new Map([["test", "Test"]]);

    	// Variables
    	const actionOptions = [
    		{ name: "Show", value: "show" },
    		{ name: "Hide", value: "hide" },
    		{ name: "Enable", value: "enable" },
    		{ name: "Disable", value: "disable" },
    		{ name: "Require", value: "require" },
    		{ name: "Unrequire", value: "unrequire" },
    		{ name: "Interaction", value: "custom" }
    	];

    	// Functions
    	const dispatch = createEventDispatcher();

    	const writable_props = ["action", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ActionsBlock> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ActionsBlock", $$slots, []);

    	function select_value_binding(value) {
    		action.action = value;
    		$$invalidate(0, action);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function input_value_binding(value) {
    		action.selector = value;
    		$$invalidate(0, action);
    	}

    	function input_handler_1(event) {
    		bubble($$self, event);
    	}

    	function checkbox_checked_binding(value) {
    		action.clear = value;
    		$$invalidate(0, action);
    	}

    	const click_handler = () => dispatch("addaction");
    	const click_handler_1 = () => dispatch("removeaction", action);

    	$$self.$$set = $$props => {
    		if ("action" in $$props) $$invalidate(0, action = $$props.action);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ControlButton,
    		Select,
    		Input,
    		Checkbox,
    		action,
    		index,
    		test,
    		actionOptions,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("action" in $$props) $$invalidate(0, action = $$props.action);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		action,
    		index,
    		actionOptions,
    		dispatch,
    		select_value_binding,
    		input_handler,
    		input_value_binding,
    		input_handler_1,
    		checkbox_checked_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class ActionsBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$M, create_fragment$M, safe_not_equal, { action: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ActionsBlock",
    			options,
    			id: create_fragment$M.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*action*/ ctx[0] === undefined && !("action" in props)) {
    			console.warn("<ActionsBlock> was created without expected prop 'action'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<ActionsBlock> was created without expected prop 'index'");
    		}
    	}

    	get action() {
    		throw new Error("<ActionsBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<ActionsBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<ActionsBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<ActionsBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\icons\back-button-icon.svg generated by Svelte v3.24.1 */

    function create_fragment$N(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ viewBox: "0 0 512 253" },
    		{ fill: "currentColor" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { viewbox: true, fill: true, xmlns: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M153.21 172.286H498.286C505.859 172.286 512 166.145 512\r\n    158.571V94.5714C512 86.9977 505.859 80.8572 498.286\r\n    80.8572H153.21V28.2183C153.21 3.78172 123.666 -8.45598 106.386\r\n    8.82287L8.03314 107.176C-2.67885 117.888 -2.67885 135.255 8.03314\r\n    145.966L106.386 244.319C123.665 261.598 153.21 249.36 153.21\r\n    224.923V172.286Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 512 253" },
    				{ fill: "currentColor" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$N($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class BackButtonIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$N, create_fragment$N, safe_not_equal, {});
    	}
    }

    /* src\ui\BackButton.svelte generated by Svelte v3.24.1 */
    const file$r = "src\\ui\\BackButton.svelte";

    function create_fragment$O(ctx) {
    	let button;
    	let backbuttonicon;
    	let current;
    	let mounted;
    	let dispose;

    	backbuttonicon = new BackButtonIcon({
    			props: { class: "back-button" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(backbuttonicon.$$.fragment);
    			attr_dev(button, "type", "button");
    			add_location(button, file$r, 5, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(backbuttonicon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backbuttonicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backbuttonicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(backbuttonicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$O.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$O($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BackButton", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$capture_state = () => ({ BackButtonIcon });
    	return [click_handler];
    }

    class BackButton$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$O, create_fragment$O, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackButton",
    			options,
    			id: create_fragment$O.name
    		});
    	}
    }

    /* src\pages\logic\components\LogicEditor.svelte generated by Svelte v3.24.1 */
    const file$s = "src\\pages\\logic\\components\\LogicEditor.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (107:4) {#each logic.conditions as condition, index (index)}
    function create_each_block_1$2(key_1, ctx) {
    	let div;
    	let conditionsblock;
    	let t;
    	let div_transition;
    	let current;

    	conditionsblock = new ConditionsBlock({
    			props: {
    				condition: /*condition*/ ctx[22],
    				index: /*index*/ ctx[21]
    			},
    			$$inline: true
    		});

    	conditionsblock.$on("addcondition", /*addCondition*/ ctx[8]);
    	conditionsblock.$on("removecondition", /*removeCondition*/ ctx[10]);
    	conditionsblock.$on("input", /*checkFilledInputs*/ ctx[6]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(conditionsblock.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "hflex-c-s mb-4");
    			add_location(div, file$s, 107, 6, 3657);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(conditionsblock, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const conditionsblock_changes = {};
    			if (dirty & /*logic*/ 8) conditionsblock_changes.condition = /*condition*/ ctx[22];
    			if (dirty & /*logic*/ 8) conditionsblock_changes.index = /*index*/ ctx[21];
    			conditionsblock.$set(conditionsblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(conditionsblock.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(conditionsblock.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(conditionsblock);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(107:4) {#each logic.conditions as condition, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (132:6) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "If the condition is met, then do the following actions:";
    			attr_dev(div, "class", "bold");
    			add_location(div, file$s, 132, 8, 4404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(132:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (121:6) {#if logic.conditions.length > 1}
    function create_if_block$b(ctx) {
    	let label;
    	let t1;
    	let select;
    	let updating_value;
    	let t2;
    	let div;
    	let current;

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[13].call(null, value);
    	}

    	let select_props = {
    		id: "operator",
    		name: "Operator",
    		options: /*operators*/ ctx[4],
    		extraClass: "_w-auto flex-initial mx-2"
    	};

    	if (/*logic*/ ctx[3].operator !== void 0) {
    		select_props.value = /*logic*/ ctx[3].operator;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding));

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "If";
    			t1 = space();
    			create_component(select.$$.fragment);
    			t2 = space();
    			div = element("div");
    			div.textContent = "then do the following actions:";
    			attr_dev(label, "for", "operator");
    			attr_dev(label, "class", "bold");
    			add_location(label, file$s, 121, 8, 4074);
    			attr_dev(div, "class", "bold");
    			add_location(div, file$s, 130, 8, 4325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(select, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};

    			if (!updating_value && dirty & /*logic*/ 8) {
    				updating_value = true;
    				select_changes.value = /*logic*/ ctx[3].operator;
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			destroy_component(select, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(121:6) {#if logic.conditions.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (141:4) {#each logic.actions as action, index (index)}
    function create_each_block$7(key_1, ctx) {
    	let div;
    	let actionsblock;
    	let t;
    	let div_transition;
    	let current;

    	actionsblock = new ActionsBlock({
    			props: {
    				action: /*action*/ ctx[19],
    				index: /*index*/ ctx[21]
    			},
    			$$inline: true
    		});

    	actionsblock.$on("addaction", /*addAction*/ ctx[9]);
    	actionsblock.$on("removeaction", /*removeAction*/ ctx[11]);
    	actionsblock.$on("input", /*checkFilledInputs*/ ctx[6]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(actionsblock.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "hflex-c-s mb-4");
    			add_location(div, file$s, 141, 6, 4616);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(actionsblock, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const actionsblock_changes = {};
    			if (dirty & /*logic*/ 8) actionsblock_changes.action = /*action*/ ctx[19];
    			if (dirty & /*logic*/ 8) actionsblock_changes.index = /*index*/ ctx[21];
    			actionsblock.$set(actionsblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actionsblock.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actionsblock.$$.fragment, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(actionsblock);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(141:4) {#each logic.actions as action, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$P(ctx) {
    	let div3;
    	let div0;
    	let backbutton;
    	let t0;
    	let h1;
    	let t1_value = (/*editID*/ ctx[0] ? "Edit" : "Add new") + "";
    	let t1;
    	let t2;
    	let t3;
    	let form;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t4;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let t5;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let t6;
    	let div2;
    	let button0;
    	let t8;
    	let button1;

    	let t9_value = (/*missingFields*/ ctx[1] && /*triedToSubmit*/ ctx[2]
    	? "Some Fields Are Missing"
    	: "Save Logic") + "";

    	let t9;
    	let current;
    	let mounted;
    	let dispose;
    	backbutton = new BackButton$1({ $$inline: true });
    	backbutton.$on("click", /*click_handler*/ ctx[12]);
    	let each_value_1 = /*logic*/ ctx[3].conditions;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*index*/ ctx[21];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$2(key, child_ctx));
    	}

    	const if_block_creators = [create_if_block$b, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*logic*/ ctx[3].conditions.length > 1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value = /*logic*/ ctx[3].actions;
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*index*/ ctx[21];
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(backbutton.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = text(" logic");
    			t3 = space();
    			form = element("form");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			if_block.c();
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t8 = space();
    			button1 = element("button");
    			t9 = text(t9_value);
    			attr_dev(h1, "class", "center");
    			add_location(h1, file$s, 99, 4, 3428);
    			attr_dev(div0, "class", "relative px-8");
    			add_location(div0, file$s, 97, 2, 3339);
    			attr_dev(div1, "class", "hflex-c-s my-8");
    			add_location(div1, file$s, 118, 4, 3993);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "button outline mr-4 w-button");
    			add_location(button0, file$s, 155, 6, 4989);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "button w-button");
    			toggle_class(button1, "error", /*missingFields*/ ctx[1] && /*triedToSubmit*/ ctx[2]);
    			add_location(button1, file$s, 163, 6, 5177);
    			attr_dev(div2, "class", "hflex-c-s");
    			add_location(div2, file$s, 152, 4, 4933);
    			attr_dev(form, "id", "logic-editor");
    			attr_dev(form, "name", "Logic Editor");
    			add_location(form, file$s, 103, 2, 3520);
    			attr_dev(div3, "class", "container max-w-2xl");
    			add_location(div3, file$s, 96, 0, 3302);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(backbutton, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, form);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(form, null);
    			}

    			append_dev(form, t4);
    			append_dev(form, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(form, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			append_dev(form, t6);
    			append_dev(form, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t8);
    			append_dev(div2, button1);
    			append_dev(button1, t9);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_1*/ ctx[14], false, false, false),
    					listen_dev(button1, "click", prevent_default(/*formSubmit*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*editID*/ 1) && t1_value !== (t1_value = (/*editID*/ ctx[0] ? "Edit" : "Add new") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*logic, addCondition, removeCondition, checkFilledInputs*/ 1352) {
    				const each_value_1 = /*logic*/ ctx[3].conditions;
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, form, outro_and_destroy_block, create_each_block_1$2, t4, get_each_context_1$2);
    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}

    			if (dirty & /*logic, addAction, removeAction, checkFilledInputs*/ 2632) {
    				const each_value = /*logic*/ ctx[3].actions;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, form, outro_and_destroy_block, create_each_block$7, t6, get_each_context$7);
    				check_outros();
    			}

    			if ((!current || dirty & /*missingFields, triedToSubmit*/ 6) && t9_value !== (t9_value = (/*missingFields*/ ctx[1] && /*triedToSubmit*/ ctx[2]
    			? "Some Fields Are Missing"
    			: "Save Logic") + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*missingFields, triedToSubmit*/ 6) {
    				toggle_class(button1, "error", /*missingFields*/ ctx[1] && /*triedToSubmit*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backbutton.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backbutton.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(backbutton);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if_blocks[current_block_type_index].d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$P.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$P($$self, $$props, $$invalidate) {
    	let $logicStore;
    	validate_store(customLogicStore, "logicStore");
    	component_subscribe($$self, customLogicStore, $$value => $$invalidate(15, $logicStore = $$value));

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let { editID } = $$props;

    	// Variables
    	const defaultCondition = {
    		selector: "",
    		type: "text",
    		operator: "equal"
    	};

    	const defaultAction = { selector: "", action: "show" };

    	const operators = [
    		{
    			name: "All Conditions Are Met",
    			value: "and"
    		},
    		{
    			name: "One Condition Is Met",
    			value: "or"
    		}
    	];

    	let missingFields, triedToSubmit;

    	let logic = {
    		id: v4(),
    		conditions: [cloneDeep(defaultCondition)],
    		operator: "and",
    		actions: [cloneDeep(defaultAction)]
    	};

    	// Functions
    	const dispatch = createEventDispatcher();

    	function checkFilledInputs() {
    		return __awaiter(this, void 0, void 0, function* () {
    			yield tick();

    			for (const condition of logic.conditions) {
    				$$invalidate(1, missingFields = !condition.type || !condition.selector || !condition.operator);
    				if (missingFields) break;
    			}

    			if (missingFields) return;

    			for (const action of logic.actions) {
    				$$invalidate(1, missingFields = !action.selector || !action.action);
    				if (missingFields) break;
    			}
    		});
    	}

    	function formSubmit() {
    		return __awaiter(this, void 0, void 0, function* () {
    			if (!triedToSubmit) $$invalidate(2, triedToSubmit = true);
    			yield checkFilledInputs();
    			if (missingFields) return;
    			if (editID) customLogicStore.modify(logic); else customLogicStore.add(logic);
    			dispatch("cancel");
    		});
    	}

    	function addCondition() {
    		$$invalidate(3, logic.conditions = [...logic.conditions, cloneDeep(defaultCondition)], logic);
    	}

    	function addAction() {
    		$$invalidate(3, logic.actions = [...logic.actions, cloneDeep(defaultAction)], logic);
    	}

    	function removeCondition(e) {
    		$$invalidate(3, logic.conditions = logic.conditions.filter(condition => condition !== e.detail), logic);
    		checkFilledInputs();
    	}

    	function removeAction(e) {
    		$$invalidate(3, logic.actions = logic.actions.filter(action => action !== e.detail), logic);
    		checkFilledInputs();
    	}

    	const writable_props = ["editID"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LogicEditor> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LogicEditor", $$slots, []);
    	const click_handler = () => dispatch("cancel");

    	function select_value_binding(value) {
    		logic.operator = value;
    		(($$invalidate(3, logic), $$invalidate(0, editID)), $$invalidate(15, $logicStore));
    	}

    	const click_handler_1 = () => dispatch("cancel");

    	$$self.$$set = $$props => {
    		if ("editID" in $$props) $$invalidate(0, editID = $$props.editID);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		uuidv4: v4,
    		cloneDeep,
    		createEventDispatcher,
    		tick,
    		fade,
    		logicStore: customLogicStore,
    		ConditionsBlock,
    		ActionsBlock,
    		BackButton: BackButton$1,
    		Select,
    		editID,
    		defaultCondition,
    		defaultAction,
    		operators,
    		missingFields,
    		triedToSubmit,
    		logic,
    		dispatch,
    		checkFilledInputs,
    		formSubmit,
    		addCondition,
    		addAction,
    		removeCondition,
    		removeAction,
    		$logicStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("editID" in $$props) $$invalidate(0, editID = $$props.editID);
    		if ("missingFields" in $$props) $$invalidate(1, missingFields = $$props.missingFields);
    		if ("triedToSubmit" in $$props) $$invalidate(2, triedToSubmit = $$props.triedToSubmit);
    		if ("logic" in $$props) $$invalidate(3, logic = $$props.logic);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*editID, $logicStore*/ 32769) {
    			// Reactive
    			 if (editID) $$invalidate(3, logic = $logicStore.find(logic => logic.id === editID));
    		}
    	};

    	return [
    		editID,
    		missingFields,
    		triedToSubmit,
    		logic,
    		operators,
    		dispatch,
    		checkFilledInputs,
    		formSubmit,
    		addCondition,
    		addAction,
    		removeCondition,
    		removeAction,
    		click_handler,
    		select_value_binding,
    		click_handler_1
    	];
    }

    class LogicEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$P, create_fragment$P, safe_not_equal, { editID: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogicEditor",
    			options,
    			id: create_fragment$P.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*editID*/ ctx[0] === undefined && !("editID" in props)) {
    			console.warn("<LogicEditor> was created without expected prop 'editID'");
    		}
    	}

    	get editID() {
    		throw new Error("<LogicEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editID(value) {
    		throw new Error("<LogicEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const logicSlides = {
        intro: [
            {
                title: 'Intro',
                content: `<p>
      Build your form in the Webflow Designer as you would normally
      do.<br />
    </p>
    <p>
      Then, create your logic in the builder. You can set as many
      conditions and actions to be performed, the code will be
      automatically generated for you!<br />
    </p>
    <p>Check the next steps to see what you can do with it :)<br /></p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee9b27330483f41b4be2_Intro-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee9b27330483f41b4be2_Intro-transcode.webm',
            },
            {
                title: 'Single action target',
                content: `<p>
      You can set the target of an action to be any form element (input,
      select, checkbox, radio...).<br />
    </p>
    <p>To do so, use its ID:<br /></p>
    <p class="text-sm pl-4 mb-6">
      <strong>E.g.</strong> make input which ID is <span class="opacity-75"
        >surname</span
      >
      to be required.<br />
    </p>
    <p>
      You can show, hide, enable, disable, require or unrequire it.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43eea0273304c2341b4be3_Single Action Target-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43eea0273304c2341b4be3_Single Action Target-transcode.webm',
            },
            {
                title: 'Group action target',
                content: `<p>
      You can also group multiple elements inside a
      <em>Div Block</em>.<br />
    </p>
    <p>
      If you set that <em>Div Block</em> as the target of an action, all
      the inputs inside it will be affected.<br />
    </p>
    <p>To do so, use that block ID:<br /></p>
    <p class="text-sm pl-4">
      <strong>E.g.</strong> disable all inputs that are inside the
      <em>Div Block</em> which ID is
      <span class="opacity-75">contact-info</span>.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee94877e0a3bf5d60731_Group Action Target-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee94877e0a3bf5d60731_Group Action Target-transcode.webm',
            },
            {
                title: 'Action Interactions',
                content: `<p>
      You can trigger Webflow Interactions when any action is
      performed.<br />
    </p>
    <p>
      To do so, you must first set your target as a Group Action
      Target:<br />
    </p>
    <p class="text-sm pl-4 mb-6">
      <em
        >&quot;Put your target inside a Div Block and use its ID as
        the target.&quot;</em
      >
    </p>
    <p>
      Then add inside the group a hidden <em>Div Block</em> with the
      custom attribute:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-logic</li>
      <li>
        <strong>Value:</strong> show, hide, enable, disable, require
        or unrequire.
      </li>
    </ul>
    <p>
      And bind it to a
      <span class="opacity-75">Mouse click (tap)</span>
      interaction.<br />When an action is performed, the script will
      click the correspondent trigger.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>E.g.</strong> when you show the input
      <span class="opacity-75">phone</span>, the script will click the
      <em>Div Block</em> that has the attribute
      <span class="opacity-75">data-logic=show</span>.
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee8bf4340039b7f3c9f0_Action Interactions-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee8bf4340039b7f3c9f0_Action Interactions-transcode.webm',
            },
            {
                title: 'Important!',
                content: `<p>
      When you choose to <em>show </em>or <em>hide </em>a target, by
      default the script will set it to
      <span class="opacity-75">display: block</span> or
      <span class="opacity-75">display: none</span>.<br />
    </p>
    <p>
      If you bind a Webflow Interaction to the <em>hide </em>or
      <em>show </em>actions, you should set that display property.<br />
    </p>
    <p class="text-sm pl-4 mb-8">
      <strong>E.g.</strong> when the target is showed, trigger a Webflow
      Interaction that sets
      <span class="opacity-75">display: flex</span> and
      <span class="opacity-75">opacity: 100%</span>.<br />
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee986da478c1e7b0e034_Important-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee986da478c1e7b0e034_Important-transcode.webm',
            },
            {
                title: 'Custom interactions',
                content: `<p>
      You can also trigger a random interaction that isn&#x27;t binded
      to any specific action.<br />
    </p>
    <p>
      To do so, select <strong>Interaction<em> </em></strong>as the
      trigger.<br />
    </p>
    <p>
      The script will click that trigger when the conditions are
      met.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>E.g.</strong> click the element with the ID
      <span class="opacity-75">show-modal</span> when the conditions
      are met.
    </p>`,
                video1: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee90128e383bb89ab0db_Custom Interactions-transcode.mp4',
                video2: 'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee90128e383bb89ab0db_Custom Interactions-transcode.webm',
            },
        ],
        submitHiddenInputs: [
            {
                title: 'Submit hidden inputs',
                content: `<p>
      You can choose if the inputs that are affected by the action
      <strong>hide</strong> should be submitted or not.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Warning:</strong> not submitting the hidden inputs can
      affect 3rd party integrations like Zapier, as the form could
      receive different fields depending on user actions.
    </p>`,
                video1: '',
                video2: '',
            },
        ],
        checkConditionsOnLoad: [
            {
                title: 'Check conditions on load',
                content: `<p>
      If you select this option, the script will check if any of the
      conditions is already met when the page loads and triggers the
      correspondent actions.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Note:</strong> it is recommended to leave this option
      checked, as not doing so could lead to unexpected behaviours.
    </p>`,
                video1: '',
                video2: '',
            },
        ],
    };

    /* src\pages\logic\Logic.svelte generated by Svelte v3.24.1 */
    const file$t = "src\\pages\\logic\\Logic.svelte";

    // (48:0) {:else}
    function create_else_block$3(ctx) {
    	let transitionwrap;
    	let current;

    	transitionwrap = new TransitionWrap({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(transitionwrap.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(transitionwrap, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const transitionwrap_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				transitionwrap_changes.$$scope = { dirty, ctx };
    			}

    			transitionwrap.$set(transitionwrap_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transitionwrap.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transitionwrap.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transitionwrap, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(48:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:0) {#if editMode}
    function create_if_block_1$6(ctx) {
    	let transitionwrap;
    	let current;

    	transitionwrap = new TransitionWrap({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(transitionwrap.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(transitionwrap, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const transitionwrap_changes = {};

    			if (dirty & /*$$scope, editID*/ 1026) {
    				transitionwrap_changes.$$scope = { dirty, ctx };
    			}

    			transitionwrap.$set(transitionwrap_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transitionwrap.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transitionwrap.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transitionwrap, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(40:0) {#if editMode}",
    		ctx
    	});

    	return block;
    }

    // (49:2) <TransitionWrap>
    function create_default_slot_1$1(ctx) {
    	let section;
    	let hero;
    	let t;
    	let logiclist;
    	let current;

    	hero = new Hero({
    			props: {
    				title: "Conditional Logic",
    				subtitle: "Here you can build all the conditions and actions that you\r\n        want to add to the form.",
    				primaryText: "Quick intro",
    				secondaryText: "Watch tutorials"
    			},
    			$$inline: true
    		});

    	hero.$on("primaryclick", /*primaryclick_handler*/ ctx[8]);
    	logiclist = new LogicList({ $$inline: true });
    	logiclist.$on("newLogic", /*newLogic*/ ctx[4]);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(hero.$$.fragment);
    			t = space();
    			create_component(logiclist.$$.fragment);
    			attr_dev(section, "class", "section");
    			add_location(section, file$t, 49, 4, 1221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(hero, section, null);
    			append_dev(section, t);
    			mount_component(logiclist, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(logiclist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(logiclist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(hero);
    			destroy_component(logiclist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(49:2) <TransitionWrap>",
    		ctx
    	});

    	return block;
    }

    // (41:2) <TransitionWrap>
    function create_default_slot$2(ctx) {
    	let section;
    	let logiceditor;
    	let current;

    	logiceditor = new LogicEditor({
    			props: { editID: /*editID*/ ctx[1] },
    			$$inline: true
    		});

    	logiceditor.$on("cancel", /*cancelEdit*/ ctx[5]);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(logiceditor.$$.fragment);
    			attr_dev(section, "class", "section min-h-screen");
    			add_location(section, file$t, 41, 4, 1029);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(logiceditor, section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const logiceditor_changes = {};
    			if (dirty & /*editID*/ 2) logiceditor_changes.editID = /*editID*/ ctx[1];
    			logiceditor.$set(logiceditor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logiceditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logiceditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(logiceditor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(41:2) <TransitionWrap>",
    		ctx
    	});

    	return block;
    }

    // (67:0) {#if showModal}
    function create_if_block$c(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: { slides: /*slides*/ ctx[3] },
    			$$inline: true
    		});

    	modal.$on("closemodal", /*closeModal*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty & /*slides*/ 8) modal_changes.slides = /*slides*/ ctx[3];
    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(67:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$Q(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$6, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*editMode*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*showModal*/ ctx[2] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t.parentNode, t);
    			}

    			if (/*showModal*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showModal*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$c(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Q($$self, $$props, $$invalidate) {
    	

    	// Variables
    	let editMode = false;

    	let editID = null;
    	let showModal = false;
    	let slides = [];

    	// Functions
    	function newLogic() {
    		$$invalidate(0, editMode = true);
    	}

    	function editLogic(id) {
    		$$invalidate(0, editMode = true);
    		$$invalidate(1, editID = id);
    	}

    	function cancelEdit() {
    		$$invalidate(0, editMode = false);
    		$$invalidate(1, editID = null);
    	}

    	function openModal(key) {
    		$$invalidate(3, slides = logicSlides[key]);
    		$$invalidate(2, showModal = true);
    	}

    	function closeModal() {
    		$$invalidate(2, showModal = false);
    	}

    	// Context
    	setContext("logic", { editLogic, openModal });

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Logic> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Logic", $$slots, []);
    	const primaryclick_handler = () => openModal("intro");

    	$$self.$capture_state = () => ({
    		setContext,
    		fade,
    		logicStore: customLogicStore,
    		Hero,
    		TransitionWrap,
    		Modal,
    		LogicList,
    		LogicEditor,
    		logicSlides,
    		editMode,
    		editID,
    		showModal,
    		slides,
    		newLogic,
    		editLogic,
    		cancelEdit,
    		openModal,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("editMode" in $$props) $$invalidate(0, editMode = $$props.editMode);
    		if ("editID" in $$props) $$invalidate(1, editID = $$props.editID);
    		if ("showModal" in $$props) $$invalidate(2, showModal = $$props.showModal);
    		if ("slides" in $$props) $$invalidate(3, slides = $$props.slides);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		editMode,
    		editID,
    		showModal,
    		slides,
    		newLogic,
    		cancelEdit,
    		openModal,
    		closeModal,
    		primaryclick_handler
    	];
    }

    class Logic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logic",
    			options,
    			id: create_fragment$Q.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var clipboard = createCommonjsModule(function (module, exports) {
    /*!
     * clipboard.js v2.0.6
     * https://clipboardjs.com/
     * 
     * Licensed MIT © Zeno Rocha
     */
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(commonjsGlobal, function() {
    return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
    /******/ 			return installedModules[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// define __esModule on exports
    /******/ 	__webpack_require__.r = function(exports) {
    /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    /******/ 		}
    /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
    /******/ 	};
    /******/
    /******/ 	// create a fake namespace object
    /******/ 	// mode & 1: value is a module id, require it
    /******/ 	// mode & 2: merge all properties of value into the ns
    /******/ 	// mode & 4: return value when already ns object
    /******/ 	// mode & 8|1: behave like require
    /******/ 	__webpack_require__.t = function(value, mode) {
    /******/ 		if(mode & 1) value = __webpack_require__(value);
    /******/ 		if(mode & 8) return value;
    /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    /******/ 		var ns = Object.create(null);
    /******/ 		__webpack_require__.r(ns);
    /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    /******/ 		return ns;
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 6);
    /******/ })
    /************************************************************************/
    /******/ ([
    /* 0 */
    /***/ (function(module, exports) {

    function select(element) {
        var selectedText;

        if (element.nodeName === 'SELECT') {
            element.focus();

            selectedText = element.value;
        }
        else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
            var isReadOnly = element.hasAttribute('readonly');

            if (!isReadOnly) {
                element.setAttribute('readonly', '');
            }

            element.select();
            element.setSelectionRange(0, element.value.length);

            if (!isReadOnly) {
                element.removeAttribute('readonly');
            }

            selectedText = element.value;
        }
        else {
            if (element.hasAttribute('contenteditable')) {
                element.focus();
            }

            var selection = window.getSelection();
            var range = document.createRange();

            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            selectedText = selection.toString();
        }

        return selectedText;
    }

    module.exports = select;


    /***/ }),
    /* 1 */
    /***/ (function(module, exports) {

    function E () {
      // Keep this empty so it's easier to inherit from
      // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
    }

    E.prototype = {
      on: function (name, callback, ctx) {
        var e = this.e || (this.e = {});

        (e[name] || (e[name] = [])).push({
          fn: callback,
          ctx: ctx
        });

        return this;
      },

      once: function (name, callback, ctx) {
        var self = this;
        function listener () {
          self.off(name, listener);
          callback.apply(ctx, arguments);
        }
        listener._ = callback;
        return this.on(name, listener, ctx);
      },

      emit: function (name) {
        var data = [].slice.call(arguments, 1);
        var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
        var i = 0;
        var len = evtArr.length;

        for (i; i < len; i++) {
          evtArr[i].fn.apply(evtArr[i].ctx, data);
        }

        return this;
      },

      off: function (name, callback) {
        var e = this.e || (this.e = {});
        var evts = e[name];
        var liveEvents = [];

        if (evts && callback) {
          for (var i = 0, len = evts.length; i < len; i++) {
            if (evts[i].fn !== callback && evts[i].fn._ !== callback)
              liveEvents.push(evts[i]);
          }
        }

        // Remove event from queue to prevent memory leak
        // Suggested by https://github.com/lazd
        // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

        (liveEvents.length)
          ? e[name] = liveEvents
          : delete e[name];

        return this;
      }
    };

    module.exports = E;
    module.exports.TinyEmitter = E;


    /***/ }),
    /* 2 */
    /***/ (function(module, exports, __webpack_require__) {

    var is = __webpack_require__(3);
    var delegate = __webpack_require__(4);

    /**
     * Validates all params and calls the right
     * listener function based on its target type.
     *
     * @param {String|HTMLElement|HTMLCollection|NodeList} target
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listen(target, type, callback) {
        if (!target && !type && !callback) {
            throw new Error('Missing required arguments');
        }

        if (!is.string(type)) {
            throw new TypeError('Second argument must be a String');
        }

        if (!is.fn(callback)) {
            throw new TypeError('Third argument must be a Function');
        }

        if (is.node(target)) {
            return listenNode(target, type, callback);
        }
        else if (is.nodeList(target)) {
            return listenNodeList(target, type, callback);
        }
        else if (is.string(target)) {
            return listenSelector(target, type, callback);
        }
        else {
            throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
        }
    }

    /**
     * Adds an event listener to a HTML element
     * and returns a remove listener function.
     *
     * @param {HTMLElement} node
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNode(node, type, callback) {
        node.addEventListener(type, callback);

        return {
            destroy: function() {
                node.removeEventListener(type, callback);
            }
        }
    }

    /**
     * Add an event listener to a list of HTML elements
     * and returns a remove listener function.
     *
     * @param {NodeList|HTMLCollection} nodeList
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNodeList(nodeList, type, callback) {
        Array.prototype.forEach.call(nodeList, function(node) {
            node.addEventListener(type, callback);
        });

        return {
            destroy: function() {
                Array.prototype.forEach.call(nodeList, function(node) {
                    node.removeEventListener(type, callback);
                });
            }
        }
    }

    /**
     * Add an event listener to a selector
     * and returns a remove listener function.
     *
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenSelector(selector, type, callback) {
        return delegate(document.body, selector, type, callback);
    }

    module.exports = listen;


    /***/ }),
    /* 3 */
    /***/ (function(module, exports) {

    /**
     * Check if argument is a HTML element.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.node = function(value) {
        return value !== undefined
            && value instanceof HTMLElement
            && value.nodeType === 1;
    };

    /**
     * Check if argument is a list of HTML elements.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.nodeList = function(value) {
        var type = Object.prototype.toString.call(value);

        return value !== undefined
            && (type === '[object NodeList]' || type === '[object HTMLCollection]')
            && ('length' in value)
            && (value.length === 0 || exports.node(value[0]));
    };

    /**
     * Check if argument is a string.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.string = function(value) {
        return typeof value === 'string'
            || value instanceof String;
    };

    /**
     * Check if argument is a function.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.fn = function(value) {
        var type = Object.prototype.toString.call(value);

        return type === '[object Function]';
    };


    /***/ }),
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {

    var closest = __webpack_require__(5);

    /**
     * Delegates event to a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} useCapture
     * @return {Object}
     */
    function _delegate(element, selector, type, callback, useCapture) {
        var listenerFn = listener.apply(this, arguments);

        element.addEventListener(type, listenerFn, useCapture);

        return {
            destroy: function() {
                element.removeEventListener(type, listenerFn, useCapture);
            }
        }
    }

    /**
     * Delegates event to a selector.
     *
     * @param {Element|String|Array} [elements]
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} useCapture
     * @return {Object}
     */
    function delegate(elements, selector, type, callback, useCapture) {
        // Handle the regular Element usage
        if (typeof elements.addEventListener === 'function') {
            return _delegate.apply(null, arguments);
        }

        // Handle Element-less usage, it defaults to global delegation
        if (typeof type === 'function') {
            // Use `document` as the first parameter, then apply arguments
            // This is a short way to .unshift `arguments` without running into deoptimizations
            return _delegate.bind(null, document).apply(null, arguments);
        }

        // Handle Selector-based usage
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }

        // Handle Array-like based usage
        return Array.prototype.map.call(elements, function (element) {
            return _delegate(element, selector, type, callback, useCapture);
        });
    }

    /**
     * Finds closest match and invokes callback.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Function}
     */
    function listener(element, selector, type, callback) {
        return function(e) {
            e.delegateTarget = closest(e.target, selector);

            if (e.delegateTarget) {
                callback.call(element, e);
            }
        }
    }

    module.exports = delegate;


    /***/ }),
    /* 5 */
    /***/ (function(module, exports) {

    var DOCUMENT_NODE_TYPE = 9;

    /**
     * A polyfill for Element.matches()
     */
    if (typeof Element !== 'undefined' && !Element.prototype.matches) {
        var proto = Element.prototype;

        proto.matches = proto.matchesSelector ||
                        proto.mozMatchesSelector ||
                        proto.msMatchesSelector ||
                        proto.oMatchesSelector ||
                        proto.webkitMatchesSelector;
    }

    /**
     * Finds the closest parent that matches a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @return {Function}
     */
    function closest (element, selector) {
        while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
            if (typeof element.matches === 'function' &&
                element.matches(selector)) {
              return element;
            }
            element = element.parentNode;
        }
    }

    module.exports = closest;


    /***/ }),
    /* 6 */
    /***/ (function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);

    // EXTERNAL MODULE: ./node_modules/select/src/select.js
    var src_select = __webpack_require__(0);
    var select_default = /*#__PURE__*/__webpack_require__.n(src_select);

    // CONCATENATED MODULE: ./src/clipboard-action.js
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



    /**
     * Inner class which performs selection from either `text` or `target`
     * properties and then executes copy or cut operations.
     */

    var clipboard_action_ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }

            /**
             * Decides which selection strategy is going to be applied based
             * on the existence of `text` and `target` properties.
             */

        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }

            /**
             * Creates a fake textarea element, sets its value from `text` property,
             * and makes a selection on it.
             */

        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = select_default()(this.fakeElem);
                this.copyText();
            }

            /**
             * Only removes the fake element after another click event, that way
             * a user can hit `Ctrl+C` to copy because selection still exists.
             */

        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }

            /**
             * Selects the content from element passed on `target` property.
             */

        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = select_default()(this.target);
                this.copyText();
            }

            /**
             * Executes the copy operation based on the current selection.
             */

        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }

            /**
             * Fires an event based on the copy operation result.
             * @param {Boolean} succeeded
             */

        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }

            /**
             * Moves focus away from `target` and back to the trigger, removes current selection.
             */

        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }
                document.activeElement.blur();
                window.getSelection().removeAllRanges();
            }

            /**
             * Sets the `action` to be performed which can be either 'copy' or 'cut'.
             * @param {String} action
             */

        }, {
            key: 'destroy',


            /**
             * Destroy lifecycle.
             */
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            }

            /**
             * Gets the `action` property.
             * @return {String}
             */
            ,
            get: function get() {
                return this._action;
            }

            /**
             * Sets the `target` property using an element
             * that will be have its content copied.
             * @param {Element} target
             */

        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            }

            /**
             * Gets the `target` property.
             * @return {String|HTMLElement}
             */
            ,
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    /* harmony default export */ var clipboard_action = (clipboard_action_ClipboardAction);
    // EXTERNAL MODULE: ./node_modules/tiny-emitter/index.js
    var tiny_emitter = __webpack_require__(1);
    var tiny_emitter_default = /*#__PURE__*/__webpack_require__.n(tiny_emitter);

    // EXTERNAL MODULE: ./node_modules/good-listener/src/listen.js
    var listen = __webpack_require__(2);
    var listen_default = /*#__PURE__*/__webpack_require__.n(listen);

    // CONCATENATED MODULE: ./src/clipboard.js
    var clipboard_typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var clipboard_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function clipboard_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }





    /**
     * Base class which takes one or more elements, adds event listeners to them,
     * and instantiates a new `ClipboardAction` on each click.
     */

    var clipboard_Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            clipboard_classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        clipboard_createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = clipboard_typeof(options.container) === 'object' ? options.container : document.body;
            }

            /**
             * Adds a click event listener to the passed trigger.
             * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
             */

        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = listen_default()(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }

            /**
             * Defines a new `ClipboardAction` on each click event.
             * @param {Event} e
             */

        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new clipboard_action({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }

            /**
             * Default `action` lookup function.
             * @param {Element} trigger
             */

        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }

            /**
             * Default `target` lookup function.
             * @param {Element} trigger
             */

        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }

            /**
             * Returns the support of the given action, or all actions if no action is
             * given.
             * @param {String} [action]
             */

        }, {
            key: 'defaultText',


            /**
             * Default `text` lookup function.
             * @param {Element} trigger
             */
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }

            /**
             * Destroy lifecycle.
             */

        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(tiny_emitter_default.a);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */


    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    /* harmony default export */ var clipboard = __webpack_exports__["default"] = (clipboard_Clipboard);

    /***/ })
    /******/ ])["default"];
    });
    });

    var isRegexp = function (re) {
    	return Object.prototype.toString.call(re) === '[object RegExp]';
    };

    var isObj = function (x) {
    	var type = typeof x;
    	return x !== null && (type === 'object' || type === 'function');
    };

    var lib = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (object) => Object
        .getOwnPropertySymbols(object)
        .filter((keySymbol) => Object.prototype.propertyIsEnumerable.call(object, keySymbol));

    });

    const getOwnEnumPropSymbols = lib.default;

    var stringifyObject = (val, opts, pad) => {
    	const seen = [];

    	return (function stringify(val, opts, pad) {
    		opts = opts || {};
    		opts.indent = opts.indent || '\t';
    		pad = pad || '';

    		let tokens;

    		if (opts.inlineCharacterLimit === undefined) {
    			tokens = {
    				newLine: '\n',
    				newLineOrSpace: '\n',
    				pad,
    				indent: pad + opts.indent
    			};
    		} else {
    			tokens = {
    				newLine: '@@__STRINGIFY_OBJECT_NEW_LINE__@@',
    				newLineOrSpace: '@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@',
    				pad: '@@__STRINGIFY_OBJECT_PAD__@@',
    				indent: '@@__STRINGIFY_OBJECT_INDENT__@@'
    			};
    		}

    		const expandWhiteSpace = string => {
    			if (opts.inlineCharacterLimit === undefined) {
    				return string;
    			}

    			const oneLined = string
    				.replace(new RegExp(tokens.newLine, 'g'), '')
    				.replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ')
    				.replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');

    			if (oneLined.length <= opts.inlineCharacterLimit) {
    				return oneLined;
    			}

    			return string
    				.replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n')
    				.replace(new RegExp(tokens.pad, 'g'), pad)
    				.replace(new RegExp(tokens.indent, 'g'), pad + opts.indent);
    		};

    		if (seen.indexOf(val) !== -1) {
    			return '"[Circular]"';
    		}

    		if (val === null ||
    			val === undefined ||
    			typeof val === 'number' ||
    			typeof val === 'boolean' ||
    			typeof val === 'function' ||
    			typeof val === 'symbol' ||
    			isRegexp(val)) {
    			return String(val);
    		}

    		if (val instanceof Date) {
    			return `new Date('${val.toISOString()}')`;
    		}

    		if (Array.isArray(val)) {
    			if (val.length === 0) {
    				return '[]';
    			}

    			seen.push(val);

    			const ret = '[' + tokens.newLine + val.map((el, i) => {
    				const eol = val.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
    				let value = stringify(el, opts, pad + opts.indent);
    				if (opts.transform) {
    					value = opts.transform(val, i, value);
    				}
    				return tokens.indent + value + eol;
    			}).join('') + tokens.pad + ']';

    			seen.pop();

    			return expandWhiteSpace(ret);
    		}

    		if (isObj(val)) {
    			let objKeys = Object.keys(val).concat(getOwnEnumPropSymbols(val));

    			if (opts.filter) {
    				objKeys = objKeys.filter(el => opts.filter(val, el));
    			}

    			if (objKeys.length === 0) {
    				return '{}';
    			}

    			seen.push(val);

    			const ret = '{' + tokens.newLine + objKeys.map((el, i) => {
    				const eol = objKeys.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
    				const isSymbol = typeof el === 'symbol';
    				const isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el);
    				const key = isSymbol || isClassic ? el : stringify(el, opts);
    				let value = stringify(val[el], opts, pad + opts.indent);
    				if (opts.transform) {
    					value = opts.transform(val, el, value);
    				}
    				return tokens.indent + String(key) + ': ' + value + eol;
    			}).join('') + tokens.pad + '}';

    			seen.pop();

    			return expandWhiteSpace(ret);
    		}

    		val = String(val).replace(/[\r\n]/g, x => x === '\n' ? '\\n' : '\\r');

    		if (opts.singleQuotes === false) {
    			val = val.replace(/"/g, '\\"');
    			return `"${val}"`;
    		}

    		val = val.replace(/\\?'/g, '\\\'');
    		return `'${val}'`;
    	})(val, opts, pad);
    };

    // Helpers
    const generatedCode = derived([logicExport, msfStore], ([$logicExport, $msfStore]) => {
        const script = `<script src="${scriptSrc}"><\/script>`;
        const msfString = $msfStore.formSelector && $msfStore.nextSelector
            ? `new AWF.MSF(${stringifyObject($msfStore, {
            inlineCharacterLimit: 99999,
        })});
  `
            : '';
        const logicString = $logicExport.logicList.length > 0
            ? `new AWF.Logic(${stringifyObject($logicExport, {
            inlineCharacterLimit: 99999,
        })});`
            : '';
        return `<!-- Advanced Forms Code -->
${script}

<!-- Advanced Forms Init -->
<script>
var Webflow = Webflow || [];
Webflow.push(function () {
  ${msfString}${logicString}
});
<\/script>
`;
    });

    var prism = createCommonjsModule(function (module) {
    /* PrismJS 1.20.0
    https://prismjs.com/download.html#themes=prism&languages=markup */
    var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(u){var c=/\blang(?:uage)?-([\w-]+)\b/i,n=0,C={manual:u.Prism&&u.Prism.manual,disableWorkerMessageHandler:u.Prism&&u.Prism.disableWorkerMessageHandler,util:{encode:function e(n){return n instanceof _?new _(n.type,e(n.content),n.alias):Array.isArray(n)?n.map(e):n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).slice(8,-1)},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++n}),e.__id},clone:function t(e,r){var a,n,l=C.util.type(e);switch(r=r||{},l){case"Object":if(n=C.util.objId(e),r[n])return r[n];for(var i in a={},r[n]=a,e)e.hasOwnProperty(i)&&(a[i]=t(e[i],r));return a;case"Array":return n=C.util.objId(e),r[n]?r[n]:(a=[],r[n]=a,e.forEach(function(e,n){a[n]=t(e,r);}),a);default:return e}},getLanguage:function(e){for(;e&&!c.test(e.className);)e=e.parentElement;return e?(e.className.match(c)||[,"none"])[1].toLowerCase():"none"},currentScript:function(){if("undefined"==typeof document)return null;if("currentScript"in document)return document.currentScript;try{throw new Error}catch(e){var n=(/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(e.stack)||[])[1];if(n){var t=document.getElementsByTagName("script");for(var r in t)if(t[r].src==n)return t[r]}return null}}},languages:{extend:function(e,n){var t=C.util.clone(C.languages[e]);for(var r in n)t[r]=n[r];return t},insertBefore:function(t,e,n,r){var a=(r=r||C.languages)[t],l={};for(var i in a)if(a.hasOwnProperty(i)){if(i==e)for(var o in n)n.hasOwnProperty(o)&&(l[o]=n[o]);n.hasOwnProperty(i)||(l[i]=a[i]);}var s=r[t];return r[t]=l,C.languages.DFS(C.languages,function(e,n){n===s&&e!=t&&(this[e]=l);}),l},DFS:function e(n,t,r,a){a=a||{};var l=C.util.objId;for(var i in n)if(n.hasOwnProperty(i)){t.call(n,i,n[i],r||i);var o=n[i],s=C.util.type(o);"Object"!==s||a[l(o)]?"Array"!==s||a[l(o)]||(a[l(o)]=!0,e(o,t,i,a)):(a[l(o)]=!0,e(o,t,null,a));}}},plugins:{},highlightAll:function(e,n){C.highlightAllUnder(document,e,n);},highlightAllUnder:function(e,n,t){var r={callback:t,container:e,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};C.hooks.run("before-highlightall",r),r.elements=Array.prototype.slice.apply(r.container.querySelectorAll(r.selector)),C.hooks.run("before-all-elements-highlight",r);for(var a,l=0;a=r.elements[l++];)C.highlightElement(a,!0===n,r.callback);},highlightElement:function(e,n,t){var r=C.util.getLanguage(e),a=C.languages[r];e.className=e.className.replace(c,"").replace(/\s+/g," ")+" language-"+r;var l=e.parentNode;l&&"pre"===l.nodeName.toLowerCase()&&(l.className=l.className.replace(c,"").replace(/\s+/g," ")+" language-"+r);var i={element:e,language:r,grammar:a,code:e.textContent};function o(e){i.highlightedCode=e,C.hooks.run("before-insert",i),i.element.innerHTML=i.highlightedCode,C.hooks.run("after-highlight",i),C.hooks.run("complete",i),t&&t.call(i.element);}if(C.hooks.run("before-sanity-check",i),!i.code)return C.hooks.run("complete",i),void(t&&t.call(i.element));if(C.hooks.run("before-highlight",i),i.grammar)if(n&&u.Worker){var s=new Worker(C.filename);s.onmessage=function(e){o(e.data);},s.postMessage(JSON.stringify({language:i.language,code:i.code,immediateClose:!0}));}else o(C.highlight(i.code,i.grammar,i.language));else o(C.util.encode(i.code));},highlight:function(e,n,t){var r={code:e,grammar:n,language:t};return C.hooks.run("before-tokenize",r),r.tokens=C.tokenize(r.code,r.grammar),C.hooks.run("after-tokenize",r),_.stringify(C.util.encode(r.tokens),r.language)},tokenize:function(e,n){var t=n.rest;if(t){for(var r in t)n[r]=t[r];delete n.rest;}var a=new l;return M(a,a.head,e),function e(n,t,r,a,l,i,o){for(var s in r)if(r.hasOwnProperty(s)&&r[s]){var u=r[s];u=Array.isArray(u)?u:[u];for(var c=0;c<u.length;++c){if(o&&o==s+","+c)return;var g=u[c],f=g.inside,h=!!g.lookbehind,d=!!g.greedy,v=0,p=g.alias;if(d&&!g.pattern.global){var m=g.pattern.toString().match(/[imsuy]*$/)[0];g.pattern=RegExp(g.pattern.source,m+"g");}g=g.pattern||g;for(var y=a.next,k=l;y!==t.tail;k+=y.value.length,y=y.next){var b=y.value;if(t.length>n.length)return;if(!(b instanceof _)){var x=1;if(d&&y!=t.tail.prev){g.lastIndex=k;var w=g.exec(n);if(!w)break;var A=w.index+(h&&w[1]?w[1].length:0),P=w.index+w[0].length,S=k;for(S+=y.value.length;S<=A;)y=y.next,S+=y.value.length;if(S-=y.value.length,k=S,y.value instanceof _)continue;for(var O=y;O!==t.tail&&(S<P||"string"==typeof O.value&&!O.prev.value.greedy);O=O.next)x++,S+=O.value.length;x--,b=n.slice(k,S),w.index-=k;}else {g.lastIndex=0;var w=g.exec(b);}if(w){h&&(v=w[1]?w[1].length:0);var A=w.index+v,w=w[0].slice(v),P=A+w.length,E=b.slice(0,A),N=b.slice(P),j=y.prev;E&&(j=M(t,j,E),k+=E.length),W(t,j,x);var L=new _(s,f?C.tokenize(w,f):w,p,w,d);if(y=M(t,j,L),N&&M(t,y,N),1<x&&e(n,t,r,y.prev,k,!0,s+","+c),i)break}else if(i)break}}}}}(e,a,n,a.head,0),function(e){var n=[],t=e.head.next;for(;t!==e.tail;)n.push(t.value),t=t.next;return n}(a)},hooks:{all:{},add:function(e,n){var t=C.hooks.all;t[e]=t[e]||[],t[e].push(n);},run:function(e,n){var t=C.hooks.all[e];if(t&&t.length)for(var r,a=0;r=t[a++];)r(n);}},Token:_};function _(e,n,t,r,a){this.type=e,this.content=n,this.alias=t,this.length=0|(r||"").length,this.greedy=!!a;}function l(){var e={value:null,prev:null,next:null},n={value:null,prev:e,next:null};e.next=n,this.head=e,this.tail=n,this.length=0;}function M(e,n,t){var r=n.next,a={value:t,prev:n,next:r};return n.next=a,r.prev=a,e.length++,a}function W(e,n,t){for(var r=n.next,a=0;a<t&&r!==e.tail;a++)r=r.next;(n.next=r).prev=n,e.length-=a;}if(u.Prism=C,_.stringify=function n(e,t){if("string"==typeof e)return e;if(Array.isArray(e)){var r="";return e.forEach(function(e){r+=n(e,t);}),r}var a={type:e.type,content:n(e.content,t),tag:"span",classes:["token",e.type],attributes:{},language:t},l=e.alias;l&&(Array.isArray(l)?Array.prototype.push.apply(a.classes,l):a.classes.push(l)),C.hooks.run("wrap",a);var i="";for(var o in a.attributes)i+=" "+o+'="'+(a.attributes[o]||"").replace(/"/g,"&quot;")+'"';return "<"+a.tag+' class="'+a.classes.join(" ")+'"'+i+">"+a.content+"</"+a.tag+">"},!u.document)return u.addEventListener&&(C.disableWorkerMessageHandler||u.addEventListener("message",function(e){var n=JSON.parse(e.data),t=n.language,r=n.code,a=n.immediateClose;u.postMessage(C.highlight(r,C.languages[t],t)),a&&u.close();},!1)),C;var e=C.util.currentScript();function t(){C.manual||C.highlightAll();}if(e&&(C.filename=e.src,e.hasAttribute("data-manual")&&(C.manual=!0)),!C.manual){var r=document.readyState;"loading"===r||"interactive"===r&&e&&e.defer?document.addEventListener("DOMContentLoaded",t):window.requestAnimationFrame?window.requestAnimationFrame(t):window.setTimeout(t,16);}return C}(_self);module.exports&&(module.exports=Prism),"undefined"!=typeof commonjsGlobal&&(commonjsGlobal.Prism=Prism);
    Prism.languages.markup={comment:/<!--[\s\S]*?-->/,prolog:/<\?[\s\S]+?\?>/,doctype:{pattern:/<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,greedy:!0,inside:{"internal-subset":{pattern:/(\[)[\s\S]+(?=\]>$)/,lookbehind:!0,greedy:!0,inside:null},string:{pattern:/"[^"]*"|'[^']*'/,greedy:!0},punctuation:/^<!|>$|[[\]]/,"doctype-tag":/^DOCTYPE/,name:/[^\s<>'"]+/}},cdata:/<!\[CDATA\[[\s\S]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,greedy:!0,inside:{tag:{pattern:/^<\/?[^\s>\/]+/,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,inside:{punctuation:[{pattern:/^=/,alias:"attr-equals"},/"|'/]}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:[{pattern:/&[\da-z]{1,8};/i,alias:"named-entity"},/&#x?[\da-f]{1,8};/i]},Prism.languages.markup.tag.inside["attr-value"].inside.entity=Prism.languages.markup.entity,Prism.languages.markup.doctype.inside["internal-subset"].inside=Prism.languages.markup,Prism.hooks.add("wrap",function(a){"entity"===a.type&&(a.attributes.title=a.content.replace(/&amp;/,"&"));}),Object.defineProperty(Prism.languages.markup.tag,"addInlined",{value:function(a,e){var s={};s["language-"+e]={pattern:/(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,lookbehind:!0,inside:Prism.languages[e]},s.cdata=/^<!\[CDATA\[|\]\]>$/i;var n={"included-cdata":{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,inside:s}};n["language-"+e]={pattern:/[\s\S]+/,inside:Prism.languages[e]};var t={};t[a]={pattern:RegExp("(<__[^]*?>)(?:<!\\[CDATA\\[(?:[^\\]]|\\](?!\\]>))*\\]\\]>|(?!<!\\[CDATA\\[)[^])*?(?=</__>)".replace(/__/g,function(){return a}),"i"),lookbehind:!0,greedy:!0,inside:n},Prism.languages.insertBefore("markup","cdata",t);}}),Prism.languages.html=Prism.languages.markup,Prism.languages.mathml=Prism.languages.markup,Prism.languages.svg=Prism.languages.markup,Prism.languages.xml=Prism.languages.extend("markup",{}),Prism.languages.ssml=Prism.languages.xml,Prism.languages.atom=Prism.languages.xml,Prism.languages.rss=Prism.languages.xml;
    });

    /* src\pages\code\components\CodeBox.svelte generated by Svelte v3.24.1 */
    const file$u = "src\\pages\\code\\components\\CodeBox.svelte";

    function create_fragment$R(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let pre;
    	let code_1;
    	let t1;
    	let t2;
    	let controlbutton;
    	let updating_button;
    	let current;

    	function controlbutton_button_binding(value) {
    		/*controlbutton_button_binding*/ ctx[4].call(null, value);
    	}

    	let controlbutton_props = { action: "copy" };

    	if (/*copyButton*/ ctx[1] !== void 0) {
    		controlbutton_props.button = /*copyButton*/ ctx[1];
    	}

    	controlbutton = new ControlButton({
    			props: controlbutton_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(controlbutton, "button", controlbutton_button_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			pre = element("pre");
    			code_1 = element("code");
    			t1 = text(/*$generatedCode*/ ctx[2]);
    			t2 = space();
    			create_component(controlbutton.$$.fragment);
    			attr_dev(div0, "class", "logic-block-divider my-12");
    			add_location(div0, file$u, 18, 2, 551);
    			attr_dev(code_1, "id", "generated-code");
    			attr_dev(code_1, "class", "language-markup");
    			add_location(code_1, file$u, 25, 6, 683);
    			add_location(pre, file$u, 24, 4, 670);
    			attr_dev(div1, "class", "code-wrap");
    			add_location(div1, file$u, 21, 2, 620);
    			attr_dev(div2, "class", "container max-w-2xl");
    			add_location(div2, file$u, 15, 0, 492);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, pre);
    			append_dev(pre, code_1);
    			append_dev(code_1, t1);
    			/*code_1_binding*/ ctx[3](code_1);
    			append_dev(div1, t2);
    			mount_component(controlbutton, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$generatedCode*/ 4) set_data_dev(t1, /*$generatedCode*/ ctx[2]);
    			const controlbutton_changes = {};

    			if (!updating_button && dirty & /*copyButton*/ 2) {
    				updating_button = true;
    				controlbutton_changes.button = /*copyButton*/ ctx[1];
    				add_flush_callback(() => updating_button = false);
    			}

    			controlbutton.$set(controlbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*code_1_binding*/ ctx[3](null);
    			destroy_component(controlbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$R.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$R($$self, $$props, $$invalidate) {
    	let $generatedCode;
    	validate_store(generatedCode, "generatedCode");
    	component_subscribe($$self, generatedCode, $$value => $$invalidate(2, $generatedCode = $$value));
    	let clipboard$1, code, copyButton;

    	// Functions
    	onMount(() => {
    		clipboard$1 = new clipboard(copyButton, { target: () => code });
    		prism.highlightAll();
    	});

    	onDestroy(() => clipboard$1.destroy());
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CodeBox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CodeBox", $$slots, []);

    	function code_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			code = $$value;
    			$$invalidate(0, code);
    		});
    	}

    	function controlbutton_button_binding(value) {
    		copyButton = value;
    		$$invalidate(1, copyButton);
    	}

    	$$self.$capture_state = () => ({
    		Clipboard: clipboard,
    		onMount,
    		onDestroy,
    		generatedCode,
    		ControlButton,
    		Prism: prism,
    		clipboard: clipboard$1,
    		code,
    		copyButton,
    		$generatedCode
    	});

    	$$self.$inject_state = $$props => {
    		if ("clipboard" in $$props) clipboard$1 = $$props.clipboard;
    		if ("code" in $$props) $$invalidate(0, code = $$props.code);
    		if ("copyButton" in $$props) $$invalidate(1, copyButton = $$props.copyButton);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [code, copyButton, $generatedCode, code_1_binding, controlbutton_button_binding];
    }

    class CodeBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$R, create_fragment$R, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CodeBox",
    			options,
    			id: create_fragment$R.name
    		});
    	}
    }

    /* src\pages\code\Code.svelte generated by Svelte v3.24.1 */
    const file$v = "src\\pages\\code\\Code.svelte";

    // (6:0) <TransitionWrap extraClass="justify-center">
    function create_default_slot$3(ctx) {
    	let section;
    	let hero;
    	let t;
    	let codebox;
    	let current;

    	hero = new Hero({
    			props: {
    				title: "Get the code!",
    				subtitle: `All you have to do is copy and paste it in the <b>before &lt;/body&gt; tag</b> of the page that contains your form.`
    			},
    			$$inline: true
    		});

    	codebox = new CodeBox({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(hero.$$.fragment);
    			t = space();
    			create_component(codebox.$$.fragment);
    			attr_dev(section, "class", "section");
    			add_location(section, file$v, 6, 2, 235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(hero, section, null);
    			append_dev(section, t);
    			mount_component(codebox, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(codebox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(codebox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(hero);
    			destroy_component(codebox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(6:0) <TransitionWrap extraClass=\\\"justify-center\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$S(ctx) {
    	let transitionwrap;
    	let current;

    	transitionwrap = new TransitionWrap({
    			props: {
    				extraClass: "justify-center",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(transitionwrap.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(transitionwrap, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const transitionwrap_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				transitionwrap_changes.$$scope = { dirty, ctx };
    			}

    			transitionwrap.$set(transitionwrap_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transitionwrap.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transitionwrap.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transitionwrap, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$S.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$S($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Code> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Code", $$slots, []);
    	$$self.$capture_state = () => ({ Hero, TransitionWrap, CodeBox });
    	return [];
    }

    class Code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$S, create_fragment$S, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Code",
    			options,
    			id: create_fragment$S.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.24.1 */
    const file$w = "src\\App.svelte";

    function create_fragment$T(ctx) {
    	let div;
    	let nav;
    	let t;
    	let main;
    	let switch_instance;
    	let current;
    	nav = new Nav({ $$inline: true });
    	var switch_value = /*pages*/ ctx[1][/*$currentPage*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(nav.$$.fragment);
    			t = space();
    			main = element("main");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(main, "class", "main");
    			add_location(main, file$w, 11, 2, 369);
    			attr_dev(div, "class", "page-wrap");
    			add_location(div, file$w, 9, 0, 333);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(nav, div, null);
    			append_dev(div, t);
    			append_dev(div, main);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*pages*/ ctx[1][/*$currentPage*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(nav);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$T.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$T($$self, $$props, $$invalidate) {
    	let $currentPage;
    	validate_store(currentPage, "currentPage");
    	component_subscribe($$self, currentPage, $$value => $$invalidate(0, $currentPage = $$value));
    	const pages = [Home, Msf, Logic, Code];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Nav,
    		Home,
    		Msf,
    		Logic,
    		Code,
    		currentPage,
    		pages,
    		$currentPage
    	});

    	return [$currentPage, pages];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$T, create_fragment$T, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$T.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
