(function () {
  "use strict";

  var data = window.SQLD;
  var wide = window.matchMedia("(min-width: 1000px)");
  var LEVEL_CLASS = { "상": "lv-hi", "중": "lv-mid", "하": "lv-lo" };
  var CHEV = '<span class="chev" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M3 1l5 4-5 4z"/></svg></span>';
  var TICK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5l2.6 2.6L10 3.5"/></svg>';

  // 저장: 브라우저가 막아 두었을 수 있으므로 실패해도 화면은 그대로 동작한다.
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 */ }
  }

  // 개념(잎) 목록과 찾아보기 표를 만든다.
  var leaves = [];
  var byId = {};
  data.parts.forEach(function (part) {
    part.chapters.forEach(function (chapter) {
      chapter.sections.forEach(function (section) {
        section.nodes.forEach(function (node) {
          var q = node.q || {};
          var leaf = {
            node: node, section: section, chapter: chapter, part: part,
            text: [node.t, node.c, (node.m || []).join(" "), (node.k || []).join(" "),
              (node.x || []).join(" "), q.q, q.code, q.a, q.why, section.title].join(" ").toLowerCase()
          };
          leaves.push(leaf);
          byId[node.id] = leaf;
        });
      });
    });
  });

  var defaultOpen = ["sql"];
  data.parts.forEach(function (p) {
    defaultOpen.push(p.id);
    p.chapters.forEach(function (c) { defaultOpen.push(c.id); });
  });

  var state = {
    open: new Set(load("sqld.open", defaultOpen)),
    done: new Set(load("sqld.done", []).filter(function (id) { return byId[id]; })),
    levels: new Set(["상", "중", "하"]),
    todoOnly: false,
    query: "",
    selected: null
  };

  var treeEl = document.getElementById("tree");
  var detailEl = document.getElementById("detail");
  var hintEl = document.getElementById("detail-hint");
  var searchEl = document.getElementById("search");
  var noteEl = document.getElementById("result-note");
  var emptyEl = document.getElementById("empty");
  var els = {};      // id → li
  var cardEl = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // 본문 표기: `코드`, **강조**, 줄바꿈
  function fmt(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }
  function h(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }

  // ── 트리 그리기 ─────────────────────────────────────────────
  function branch(id, kind, label, title, level, children) {
    var li = h("li", "node k-" + kind);
    li.dataset.id = id;
    var row = h("button", "row");
    row.type = "button";
    row.innerHTML = CHEV +
      (level ? '<span class="lv ' + LEVEL_CLASS[level] + '" title="중요도 ' + level + '">' + level + "</span>" : "") +
      '<span class="row-wrap">' +
      (label ? '<span class="label">' + esc(label) + "</span>" : "") +
      '<span class="title">' + esc(title) + "</span></span>" +
      (kind === "root" ? "" : '<span class="count"></span>');
    row.addEventListener("click", function () { toggle(id); });
    li.appendChild(row);
    var ul = h("ul", "kids");
    children.forEach(function (c) { ul.appendChild(c); });
    li.appendChild(ul);
    els[id] = li;
    return li;
  }

  function leafItem(leaf) {
    var node = leaf.node;
    var li = h("li", "node k-leaf");
    li.dataset.id = node.id;
    var wrap = h("div", "leaf-row");
    var check = h("button", "check", "<i>" + TICK + "</i>");
    check.type = "button";
    check.addEventListener("click", function () { toggleDone(node.id); });
    var row = h("button", "row", '<span class="title">' + esc(node.t) + "</span>");
    row.type = "button";
    row.addEventListener("click", function () {
      select(state.selected === node.id && !wide.matches ? null : node.id);
    });
    wrap.appendChild(check);
    wrap.appendChild(row);
    li.appendChild(wrap);
    els[node.id] = li;
    return li;
  }

  function buildTree() {
    var parts = data.parts.map(function (part) {
      var chapters = part.chapters.map(function (chapter) {
        var sections = chapter.sections.map(function (section) {
          var items = section.nodes.map(function (n) { return leafItem(byId[n.id]); });
          return branch(section.id, "section", section.label, section.title, section.level, items);
        });
        return branch(chapter.id, "chapter", chapter.label, chapter.title, null, sections);
      });
      return branch(part.id, "part", part.label, part.title, null, chapters);
    });
    treeEl.appendChild(branch(data.root.id, "root", null, data.root.title, null, parts));
  }

  // ── 상태 반영 ───────────────────────────────────────────────
  function applyOpen() {
    Object.keys(els).forEach(function (id) {
      var li = els[id];
      if (li.classList.contains("k-leaf")) return;
      var open = state.open.has(id);
      li.classList.toggle("open", open);
      li.firstChild.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function applyDone() {
    leaves.forEach(function (leaf) {
      var done = state.done.has(leaf.node.id);
      var li = els[leaf.node.id];
      li.classList.toggle("done", done);
      var check = li.querySelector(".check");
      check.setAttribute("aria-pressed", done ? "true" : "false");
      check.setAttribute("aria-label", leaf.node.t + (done ? " 외웠음 해제" : " 외웠음으로 표시"));
    });
    function setCount(id, nodes) {
      var done = nodes.filter(function (n) { return state.done.has(n.id); }).length;
      els[id].querySelector(".count").textContent = done + "/" + nodes.length;
    }
    data.parts.forEach(function (part) {
      var partNodes = [];
      part.chapters.forEach(function (chapter) {
        var chNodes = [];
        chapter.sections.forEach(function (section) {
          setCount(section.id, section.nodes);
          chNodes = chNodes.concat(section.nodes);
        });
        setCount(chapter.id, chNodes);
        partNodes = partNodes.concat(chNodes);
      });
      setCount(part.id, partNodes);
    });
    var total = leaves.length;
    var count = state.done.size;
    document.getElementById("bar-fill").style.width = (total ? (count / total) * 100 : 0) + "%";
    document.getElementById("progress-text").textContent = "외운 개념 " + count + " / " + total;
    if (cardEl) {
      var btn = cardEl.querySelector(".done-btn");
      var on = state.done.has(state.selected);
      btn.textContent = on ? "외웠음 ✓" : "외웠음으로 표시";
      btn.classList.toggle("ghost", !on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function isVisible(leaf, terms) {
    if (!state.levels.has(leaf.section.level)) return false;
    if (state.todoOnly && state.done.has(leaf.node.id)) return false;
    for (var i = 0; i < terms.length; i++) {
      if (leaf.text.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  function applyFilter() {
    var terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    leaves.forEach(function (leaf) {
      var ok = isVisible(leaf, terms);
      els[leaf.node.id].hidden = !ok;
      if (ok) shown++;
    });
    data.parts.forEach(function (part) {
      var partAny = false;
      part.chapters.forEach(function (chapter) {
        var chAny = false;
        chapter.sections.forEach(function (section) {
          var any = section.nodes.some(function (n) { return !els[n.id].hidden; });
          els[section.id].hidden = !any;
          chAny = chAny || any;
        });
        els[chapter.id].hidden = !chAny;
        partAny = partAny || chAny;
      });
      els[part.id].hidden = !partAny;
    });
    treeEl.classList.toggle("searching", terms.length > 0);
    emptyEl.hidden = shown > 0;
    els[data.root.id].hidden = shown === 0;
    var filtered = terms.length > 0 || state.todoOnly || state.levels.size < 3;
    noteEl.hidden = !filtered || shown === 0;
    noteEl.textContent = "개념 " + shown + "개 표시 중 (전체 " + leaves.length + "개)";
  }

  // ── 동작 ───────────────────────────────────────────────────
  function toggle(id) {
    if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
    save("sqld.open", Array.from(state.open));
    applyOpen();
  }

  function toggleDone(id) {
    if (state.done.has(id)) state.done.delete(id); else state.done.add(id);
    save("sqld.done", Array.from(state.done));
    applyDone();
    if (state.todoOnly) applyFilter();
  }

  function openPath(leaf) {
    [data.root.id, leaf.part.id, leaf.chapter.id, leaf.section.id].forEach(function (id) { state.open.add(id); });
    save("sqld.open", Array.from(state.open));
    applyOpen();
  }

  function placeCard() {
    if (!cardEl) return;
    if (wide.matches) {
      cardEl.classList.remove("inline-card");
      detailEl.appendChild(cardEl);
      detailEl.scrollTop = 0;
    } else {
      cardEl.classList.add("inline-card");
      els[state.selected].appendChild(cardEl);
    }
  }

  function select(id, opts) {
    opts = opts || {};
    if (state.selected && els[state.selected]) els[state.selected].classList.remove("selected");
    if (cardEl) { cardEl.remove(); cardEl = null; }
    state.selected = id && byId[id] ? id : null;
    hintEl.hidden = !!state.selected;
    if (!state.selected) {
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      return;
    }
    var leaf = byId[id];
    els[id].classList.add("selected");
    cardEl = buildCard(leaf);
    placeCard();
    applyDone();
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (opts.scroll) {
      els[id].scrollIntoView({ block: wide.matches ? "center" : "start", behavior: "smooth" });
    }
  }

  // 다른 개념으로 이동: 필터에 가려져 있으면 필터를 풀고 경로를 펼친다.
  function goTo(id) {
    var leaf = byId[id];
    if (!leaf) return;
    if (els[id].hidden || els[leaf.section.id].hidden) {
      state.query = "";
      searchEl.value = "";
      state.todoOnly = false;
      state.levels = new Set(["상", "중", "하"]);
      syncChips();
      applyFilter();
    }
    openPath(leaf);
    select(id, { scroll: true });
  }

  function listBlock(cls, title, items) {
    if (!items || !items.length) return null;
    var box = h("section", "block " + cls);
    box.appendChild(h("h3", null, title));
    var ul = h("ul");
    items.forEach(function (it) { ul.appendChild(h("li", null, fmt(it))); });
    box.appendChild(ul);
    return box;
  }

  function buildCard(leaf) {
    var node = leaf.node;
    var card = h("article", "card");
    card.appendChild(h("p", "crumb", esc(leaf.part.label + " " + leaf.part.title + " › " +
      leaf.chapter.title + " › " + leaf.section.title)));
    var head = h("div", "card-head");
    head.appendChild(h("h2", null, esc(node.t)));
    head.appendChild(h("span", "lv " + LEVEL_CLASS[leaf.section.level], leaf.section.level));
    card.appendChild(head);
    card.appendChild(h("p", "core", fmt(node.c)));

    [listBlock("b-memo", "암기", node.m), listBlock("b-tip", "꿀팁", node.k),
      listBlock("b-trap", "헷갈리는 점", node.x)].forEach(function (b) { if (b) card.appendChild(b); });

    if (node.q) {
      var quiz = h("section", "block b-quiz");
      quiz.appendChild(h("h3", null, "예시 문제"));
      quiz.appendChild(h("p", null, fmt(node.q.q)));
      if (node.q.code) {
        var pre = h("pre");
        pre.textContent = node.q.code;
        quiz.appendChild(pre);
      }
      var show = h("button", "btn", "정답 보기");
      show.type = "button";
      var ans = h("div", "answer");
      ans.hidden = true;
      ans.appendChild(h("p", "a", "정답: " + fmt(node.q.a)));
      ans.appendChild(h("p", "why", fmt(node.q.why)));
      show.setAttribute("aria-expanded", "false");
      show.addEventListener("click", function () {
        ans.hidden = !ans.hidden;
        show.textContent = ans.hidden ? "정답 보기" : "정답 가리기";
        show.classList.toggle("ghost", !ans.hidden);
        show.setAttribute("aria-expanded", ans.hidden ? "false" : "true");
      });
      quiz.appendChild(show);
      quiz.appendChild(ans);
      card.appendChild(quiz);
    }

    var links = (node.l || []).filter(function (id) { return byId[id]; });
    if (links.length) {
      var box = h("section", "links");
      box.appendChild(h("h3", null, "연결된 개념"));
      var row = h("div");
      links.forEach(function (id) {
        var b = h("button", "link-chip", esc(byId[id].node.t));
        b.type = "button";
        b.addEventListener("click", function () { goTo(id); });
        row.appendChild(b);
      });
      box.appendChild(row);
      card.appendChild(box);
    }

    var foot = h("div", "card-foot");
    var doneBtn = h("button", "btn done-btn");
    doneBtn.type = "button";
    doneBtn.addEventListener("click", function () { toggleDone(node.id); });
    foot.appendChild(doneBtn);
    foot.appendChild(h("span", "spacer"));
    var idx = leaves.indexOf(leaf);
    [["← 이전", idx - 1], ["다음 →", idx + 1]].forEach(function (pair) {
      var target = leaves[pair[1]];
      if (!target) return;
      var b = h("button", "btn ghost", pair[0]);
      b.type = "button";
      b.title = target.node.t;
      b.addEventListener("click", function () { goTo(target.node.id); });
      foot.appendChild(b);
    });
    card.appendChild(foot);
    return card;
  }

  // ── 도구 막대 ───────────────────────────────────────────────
  function syncChips() {
    document.querySelectorAll(".chip[data-level]").forEach(function (chip) {
      chip.setAttribute("aria-pressed", state.levels.has(chip.dataset.level) ? "true" : "false");
    });
    document.getElementById("todo-only").setAttribute("aria-pressed", state.todoOnly ? "true" : "false");
  }

  document.querySelectorAll(".chip[data-level]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var lv = chip.dataset.level;
      if (state.levels.has(lv)) state.levels.delete(lv); else state.levels.add(lv);
      syncChips();
      applyFilter();
    });
  });
  document.getElementById("todo-only").addEventListener("click", function () {
    state.todoOnly = !state.todoOnly;
    syncChips();
    applyFilter();
  });
  document.getElementById("expand-all").addEventListener("click", function () {
    Object.keys(els).forEach(function (id) {
      if (!els[id].classList.contains("k-leaf")) state.open.add(id);
    });
    save("sqld.open", Array.from(state.open));
    applyOpen();
  });
  document.getElementById("collapse-all").addEventListener("click", function () {
    state.open = new Set(defaultOpen);
    save("sqld.open", Array.from(state.open));
    applyOpen();
  });
  searchEl.addEventListener("input", function () {
    state.query = searchEl.value.trim();
    applyFilter();
  });

  wide.addEventListener("change", placeCard);
  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (id !== (state.selected || "") && byId[id]) goTo(id);
  });

  // 후원: 마우스를 쓰는 기기(PC)에서는 QR 코드를 띄우고, 휴대폰에서는 링크가 그대로 열려 카카오페이가 켜진다.
  var donateDialog = document.getElementById("donate-dialog");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  document.querySelectorAll("[data-donate]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (!finePointer.matches || !donateDialog.showModal) return;
      e.preventDefault();
      donateDialog.showModal();
    });
  });
  document.getElementById("donate-close").addEventListener("click", function () { donateDialog.close(); });
  donateDialog.addEventListener("click", function (e) { if (e.target === donateDialog) donateDialog.close(); });

  // ── 시작 ───────────────────────────────────────────────────
  buildTree();
  applyOpen();
  applyDone();
  applyFilter();
  var first = location.hash.slice(1);
  if (byId[first]) goTo(first);
})();
