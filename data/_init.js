// 트리 뼈대. 각 data/*.js 파일이 SQLD.put(챕터 id, 섹션 배열)로 내용을 채운다.
// 노드 필드: id, t(제목), c(핵심), m(암기), k(꿀팁), x(헷갈림), q(예시 문제 {q, code, a, why}), l(연결 노드 id)
window.SQLD = {
  root: { id: "sql", title: "SQL" },
  parts: [
    {
      id: "p1", label: "PART 01", title: "데이터 모델링의 이해",
      chapters: [
        { id: "p1c1", label: "CHAPTER 01", title: "데이터 모델링", sections: [] },
        { id: "p1c2", label: "CHAPTER 02", title: "데이터 모델과 SQL", sections: [] }
      ]
    },
    {
      id: "p2", label: "PART 02", title: "SQL 기본 및 활용",
      chapters: [
        { id: "p2c1", label: "CHAPTER 01", title: "SQL 기본", sections: [] },
        { id: "p2c2", label: "CHAPTER 02", title: "SQL 활용", sections: [] },
        { id: "p2c3", label: "CHAPTER 03", title: "관리 구문", sections: [] }
      ]
    }
  ],
  put: function (chapterId, sections) {
    for (var i = 0; i < this.parts.length; i++) {
      var chs = this.parts[i].chapters;
      for (var j = 0; j < chs.length; j++) {
        if (chs[j].id === chapterId) {
          chs[j].sections = chs[j].sections.concat(sections);
          return;
        }
      }
    }
    throw new Error("없는 챕터: " + chapterId);
  },
  // 이미 있는 섹션 끝에 개념을 덧붙인다.
  add: function (sectionId, nodes) {
    for (var i = 0; i < this.parts.length; i++) {
      var chs = this.parts[i].chapters;
      for (var j = 0; j < chs.length; j++) {
        for (var k = 0; k < chs[j].sections.length; k++) {
          if (chs[j].sections[k].id === sectionId) {
            chs[j].sections[k].nodes = chs[j].sections[k].nodes.concat(nodes);
            return;
          }
        }
      }
    }
    throw new Error("없는 섹션: " + sectionId);
  }
};
