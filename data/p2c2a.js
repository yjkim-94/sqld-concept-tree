SQLD.put("p2c2", [
  {
    id: "p2c2s1", label: "SECTION 01", title: "서브쿼리", level: "상",
    nodes: [
      {
        id: "sub-kind", t: "서브쿼리의 종류와 규칙",
        c: "SQL 문 안에 들어 있는 또 다른 SELECT 문이다. 괄호로 감싸며, 쓰는 위치에 따라 이름이 다르다.",
        m: ["**스칼라 서브쿼리**: SELECT 절. 한 행·한 칼럼만 반환", "**인라인 뷰**: FROM 절. 테이블처럼 쓴다", "**중첩 서브쿼리**: WHERE·HAVING 절"],
        k: ["서브쿼리는 메인쿼리의 칼럼을 쓸 수 있지만, 메인쿼리는 서브쿼리의 칼럼을 쓸 수 없다(인라인 뷰의 칼럼은 예외).", "스칼라 서브쿼리는 결과가 없으면 **NULL**, 두 건 이상이면 **오류**다."],
        x: ["서브쿼리를 쓸 수 있는 곳: SELECT, FROM, WHERE, HAVING, ORDER BY, INSERT의 VALUES, UPDATE의 SET. **GROUP BY 절에는 쓸 수 없다**.", "중첩 서브쿼리 안에는 ORDER BY를 쓰지 않는다. 인라인 뷰에는 쓸 수 있다(Top-N)."],
        q: { q: "DEPT에 10, 20, 30, 40번 부서가 있고 40번 부서에는 사원이 없다. 40번 부서 행의 CNT와 MAXSAL은?", code: `SELECT D.DEPTNO,
       (SELECT COUNT(*) FROM EMP E WHERE E.DEPTNO = D.DEPTNO) AS CNT,
       (SELECT MAX(SAL) FROM EMP E WHERE E.DEPTNO = D.DEPTNO) AS MAXSAL
FROM   DEPT D;`, a: "CNT = 0, MAXSAL = NULL", why: "스칼라 서브쿼리는 행마다 실행된다. 해당 사원이 없으면 COUNT는 0, MAX는 NULL이다. 40번 부서 행 자체는 결과에 남는다." },
        l: ["sub-row", "sub-corr", "topn-rownum", "sub-view", "agg-empty"]
      },
      {
        id: "sub-row", t: "단일행·다중행·다중 칼럼 서브쿼리",
        c: "서브쿼리가 돌려주는 행 수에 따라 쓸 수 있는 연산자가 다르다.",
        m: ["**단일행**: 결과가 1건 이하. `=`, `<`, `>`, `<=`, `>=`, `<>`", "**다중행**: 결과가 여러 건. `IN`, `ANY`(SOME), `ALL`, `EXISTS`", "**다중 칼럼**: 여러 칼럼을 한꺼번에 비교. `WHERE (A, B) IN (SELECT …)`"],
        k: ["서브쿼리에 집계 함수만 있고 GROUP BY가 없으면 항상 1건이라 단일행 연산자를 쓸 수 있다."],
        x: ["단일행 연산자 뒤에 여러 건을 반환하는 서브쿼리가 오면 **실행 시 오류**가 난다.", "다중 칼럼 서브쿼리는 Oracle에서 지원하고 SQL Server는 지원하지 않는다."],
        q: { q: "EMP에 부서가 세 개 있다. 실행 결과는?", code: `SELECT ENAME FROM EMP
WHERE  SAL = (SELECT MAX(SAL) FROM EMP GROUP BY DEPTNO);`, a: "오류", why: "서브쿼리가 부서 수만큼 3건을 반환하는데 단일행 연산자 =를 썼다. IN으로 바꿔야 한다." },
        l: ["sub-kind", "sub-any-all"]
      },
      {
        id: "sub-any-all", t: "ANY와 ALL",
        c: "다중행 서브쿼리의 결과 여러 개와 크기를 비교한다. ANY는 하나라도, ALL은 모두를 뜻한다.",
        m: ["`> ANY`: **최솟값**보다 크면 참", "`< ANY`: **최댓값**보다 작으면 참", "`> ALL`: **최댓값**보다 크면 참", "`< ALL`: **최솟값**보다 작으면 참", "`= ANY`: `IN`과 같다"],
        k: ["ANY는 '가장 통과하기 쉬운 값', ALL은 '가장 통과하기 어려운 값'과 비교한다고 생각한다."],
        x: ["`<> ALL`은 `NOT IN`과 같다. `<> ANY`는 다르다(값이 둘 이상이면 거의 항상 참).", "서브쿼리 결과에 NULL이 있으면 ALL 비교는 참이 될 수 없다."],
        q: { q: "(가)와 (나)의 결과 행 수는?", code: `-- EMP (SAL): 1000, 2000, 3000, 4000
-- 서브쿼리 결과: 2000, 3000
SELECT * FROM EMP WHERE SAL > ANY (서브쿼리);  -- (가)
SELECT * FROM EMP WHERE SAL > ALL (서브쿼리);  -- (나)`, a: "(가) 2행 (3000, 4000), (나) 1행 (4000)", why: "> ANY는 최솟값 2000보다 큰 것, > ALL은 최댓값 3000보다 큰 것." },
        l: ["sub-row", "sub-notin"]
      },
      {
        id: "sub-corr", t: "연관 서브쿼리와 EXISTS",
        c: "서브쿼리가 메인쿼리의 칼럼을 참조하면 연관 서브쿼리다. 메인쿼리의 행마다 서브쿼리가 실행된다.",
        m: ["**비연관**: 서브쿼리가 독립적으로 한 번 실행되어 값을 메인쿼리에 준다", "**연관**: 메인쿼리의 값이 서브쿼리 조건에 쓰인다", "`EXISTS (서브쿼리)`: 결과가 **한 건이라도 있으면 참**. 주로 연관 서브쿼리와 함께 쓴다"],
        k: ["EXISTS는 행이 있는지만 본다. SELECT 절에 `1`이나 `'X'`를 써도 결과는 같다.", "EXISTS는 조건에 맞는 첫 행을 찾으면 검색을 멈춘다."],
        x: ["EXISTS 서브쿼리가 NULL 값을 반환해도 **행이 있으면 참**이다."],
        q: { q: "결과 행 수는?", code: `-- EMP (ENAME, DEPTNO, SAL)
--   A  10  1000
--   B  10  3000
--   C  20  2000
--   D  20  2000
SELECT ENAME FROM EMP E
WHERE  SAL > (SELECT AVG(SAL) FROM EMP
              WHERE  DEPTNO = E.DEPTNO);`, a: "1행 (B)", why: "자기 부서 평균보다 급여가 많은 사원이다. 10번 평균 2000 → B만, 20번 평균 2000 → 없음." },
        l: ["sub-kind", "sub-notin"]
      },
      {
        id: "sub-notin", t: "NOT IN과 NULL",
        c: "NOT IN 뒤의 목록이나 서브쿼리 결과에 NULL이 하나라도 있으면 결과가 한 건도 나오지 않는다.",
        m: ["`C NOT IN (1, NULL)` = `C <> 1 AND C <> NULL` → 뒤 조건이 항상 UNKNOWN → 전체가 참이 될 수 없다", "`IN`은 NULL이 있어도 일치하는 값은 찾는다(OR이므로)", "`NOT EXISTS`는 NULL의 영향을 받지 않는다"],
        k: ["NOT IN 서브쿼리에는 `WHERE 칼럼 IS NOT NULL`을 넣거나 NOT EXISTS로 바꾼다."],
        x: ["IN은 OR로, NOT IN은 AND로 풀어서 생각하면 헷갈리지 않는다."],
        q: { q: "(가)와 (나)의 결과 행 수는?", code: `-- DEPT (DEPTNO): 10, 20, 30, 40
-- EMP  (DEPTNO): 10, 20, NULL
-- (가)
SELECT * FROM DEPT
WHERE  DEPTNO NOT IN (SELECT DEPTNO FROM EMP);
-- (나)
SELECT * FROM DEPT D
WHERE  NOT EXISTS (SELECT 1 FROM EMP E
                   WHERE  E.DEPTNO = D.DEPTNO);`, a: "(가) 0행, (나) 2행 (30, 40)", why: "(가)는 서브쿼리 결과에 NULL이 있어 어떤 행도 참이 되지 못한다. (나)는 일치하는 사원이 없는 부서를 그대로 찾는다." },
        l: ["null-attr", "where-null", "sub-corr", "sub-any-all"]
      },
      {
        id: "sub-view", t: "뷰(View)",
        c: "SELECT 문에 이름을 붙여 저장해 둔 가상 테이블이다. 실제 데이터는 갖지 않고 SQL 정의만 저장한다.",
        m: ["**독립성**: 테이블 구조가 바뀌어도 뷰를 쓰는 응용 프로그램은 고치지 않아도 된다", "**편리성**: 복잡한 질의를 단순하게 쓸 수 있다", "**보안성**: 민감한 칼럼을 빼고 보여 줄 수 있다"],
        k: ["`CREATE VIEW 뷰이름 AS SELECT …`, `DROP VIEW 뷰이름`.", "인라인 뷰는 SQL 실행 동안만 존재하는 **동적 뷰**, CREATE VIEW로 만든 것은 **정적 뷰**다."],
        x: ["뷰는 데이터를 저장하지 않는다. 조회할 때마다 정의된 SQL이 실행된다."],
        q: { q: "뷰의 장점 세 가지는?", a: "독립성, 편리성, 보안성", why: "뷰는 성능을 높이려는 것이 아니라 구조 변경으로부터의 독립, 질의 단순화, 정보 은닉을 위한 것이다." },
        l: ["sub-kind", "schema-3"]
      }
    ]
  },
  {
    id: "p2c2s2", label: "SECTION 02", title: "집합 연산자", level: "중",
    nodes: [
      {
        id: "set-op", t: "UNION · UNION ALL · INTERSECT · MINUS",
        c: "두 SELECT 결과를 위아래로 합치거나, 겹치는 부분 또는 차이를 구한다.",
        m: ["`UNION`: 합집합, **중복 제거**", "`UNION ALL`: 합집합, **중복 그대로**", "`INTERSECT`: 교집합, 중복 제거", "`MINUS`(Oracle) / `EXCEPT`(SQL Server): 차집합, 중복 제거"],
        k: ["UNION ALL만 중복을 남긴다. 중복 제거(정렬) 작업이 없어 가장 빠르다.", "MINUS는 순서가 중요하다. A MINUS B와 B MINUS A는 다르다."],
        x: ["UNION은 한쪽 SELECT **안에서의 중복도** 제거한다.", "UNION ALL은 정렬하지 않으므로 결과 순서가 보장되지 않는다."],
        q: { q: "각 연산의 결과 행 수는?", code: `-- A (C): 1, 1, 2, 3
-- B (C): 2, 3, 3, 4
SELECT C FROM A (연산자) SELECT C FROM B;
-- UNION / UNION ALL / INTERSECT / MINUS`, a: "UNION 4행, UNION ALL 8행, INTERSECT 2행, MINUS 1행", why: "UNION {1,2,3,4}, INTERSECT {2,3}, MINUS {1}. MINUS도 중복을 제거하므로 1이 한 건만 남는다." },
        l: ["set-rule", "select-basic", "std-outer"]
      },
      {
        id: "set-rule", t: "집합 연산자 사용 규칙",
        c: "위아래 SELECT의 모양이 맞아야 한다.",
        m: ["두 SELECT의 **칼럼 수가 같아야** 한다", "같은 위치 칼럼의 **데이터 타입이 호환**되어야 한다", "결과의 칼럼명(헤더)은 **첫 번째 SELECT**를 따른다", "`ORDER BY`는 **맨 마지막에 한 번만** 쓴다"],
        k: ["칼럼명은 달라도 된다. 개수와 타입만 맞으면 된다."],
        x: ["ORDER BY에는 첫 번째 SELECT의 칼럼명·별칭이나 순번을 쓴다. 두 번째 SELECT의 별칭은 쓸 수 없다.", "연산자가 여럿이면 Oracle은 **위에서 아래로** 차례로 처리한다. SQL Server는 INTERSECT를 먼저 처리한다."],
        q: { q: "오류 없이 실행되는 ORDER BY는?\n1) ORDER BY Y\n2) ORDER BY X\n3) ORDER BY B", code: `SELECT A AS X FROM T1
UNION
SELECT B AS Y FROM T2
ORDER  BY ( ? );`, a: "2) ORDER BY X", why: "결과의 칼럼명은 첫 번째 SELECT의 별칭 X다. ORDER BY 1도 가능하다." },
        l: ["set-op", "order-basic"]
      }
    ]
  },
  {
    id: "p2c2s3", label: "SECTION 03", title: "그룹 함수", level: "중",
    nodes: [
      {
        id: "grp-rollup", t: "ROLLUP",
        c: "GROUP BY 결과에 소계와 총계를 함께 만든다. 뒤 칼럼부터 하나씩 빼 가며 집계한다.",
        m: ["`ROLLUP(A, B)` → **(A, B), (A), ()** 세 단계", "칼럼이 N개면 **N + 1** 단계", "**칼럼 순서가 바뀌면 결과가 달라진다**"],
        k: ["`ROLLUP(A, B)` = `GROUPING SETS((A, B), A, ())`.", "`GROUP BY A, ROLLUP(B)` → (A, B), (A). 총계는 없다."],
        x: ["괄호로 묶으면 한 덩어리다. `ROLLUP((A, B))` → (A, B), (). `ROLLUP(A, (B, C))` → (A, B, C), (A), ().", "ROLLUP은 정렬을 보장하지 않는다. 순서가 필요하면 ORDER BY를 쓴다."],
        q: { q: "DEPTNO가 3종류, JOB이 2종류이고 모든 조합의 사원이 있다. 결과 행 수는?", code: `SELECT DEPTNO, JOB, SUM(SAL)
FROM   EMP
GROUP  BY ROLLUP(DEPTNO, JOB);`, a: "10행", why: "(DEPTNO, JOB) 6행 + DEPTNO별 소계 3행 + 총계 1행." },
        l: ["group-by", "grp-cube", "grp-sets", "grp-grouping"]
      },
      {
        id: "grp-cube", t: "CUBE",
        c: "지정한 칼럼으로 만들 수 있는 모든 조합의 집계를 만든다.",
        m: ["`CUBE(A, B)` → **(A, B), (A), (B), ()**", "칼럼이 N개면 **2의 N제곱** 가지 조합", "**칼럼 순서와 무관**하게 결과가 같다"],
        k: ["`CUBE(A, B)` = `GROUPING SETS((A, B), A, B, ())`.", "ROLLUP 결과에 '뒤 칼럼만의 소계'가 더해진 것이다."],
        x: ["조합이 많아 시스템 부하가 ROLLUP보다 크다."],
        q: { q: "DEPTNO가 3종류, JOB이 2종류이고 모든 조합의 사원이 있다. 결과 행 수는?", code: `SELECT DEPTNO, JOB, SUM(SAL)
FROM   EMP
GROUP  BY CUBE(DEPTNO, JOB);`, a: "12행", why: "(DEPTNO, JOB) 6행 + DEPTNO별 3행 + JOB별 2행 + 총계 1행." },
        l: ["grp-rollup", "grp-sets"]
      },
      {
        id: "grp-sets", t: "GROUPING SETS",
        c: "원하는 집계 기준만 골라서 각각 따로 집계한다.",
        m: ["`GROUPING SETS(A, B)` → **(A), (B)** 각각의 소계만", "**칼럼 순서와 무관**", "총계가 필요하면 `()`를 넣는다"],
        k: ["`GROUPING SETS(A, B)`는 `GROUP BY A`와 `GROUP BY B`를 UNION ALL한 것과 같다."],
        x: ["(A, B) 조합 행은 나오지 않는다. 필요하면 `GROUPING SETS((A, B), A)`처럼 괄호로 묶어 넣는다."],
        q: { q: "DEPTNO가 3종류, JOB이 2종류다. 결과 행 수는?", code: `SELECT DEPTNO, JOB, SUM(SAL)
FROM   EMP
GROUP  BY GROUPING SETS(DEPTNO, JOB);`, a: "5행", why: "DEPTNO별 3행 + JOB별 2행. 조합 행과 총계 행은 없다." },
        l: ["grp-rollup", "grp-cube", "set-op"]
      },
      {
        id: "grp-grouping", t: "GROUPING 함수",
        c: "ROLLUP·CUBE·GROUPING SETS가 만든 소계 행에서, 그 칼럼이 집계되어 NULL로 나온 것인지 알려 준다.",
        m: ["`GROUPING(칼럼)` = **1**: 그 칼럼이 집계되어 빠진 소계·총계 행", "`GROUPING(칼럼)` = **0**: 그 칼럼 값으로 묶인 일반 행"],
        k: ["`CASE GROUPING(DEPTNO) WHEN 1 THEN '전체' ELSE …`처럼 소계 행에 이름을 붙일 때 쓴다(Oracle은 DECODE도 가능)."],
        x: ["원래 데이터가 NULL인 행과 소계 때문에 NULL인 행을 구분하려는 함수다. 원래 NULL이면 0이다."],
        q: { q: "부서별 소계 행과 총계 행에서 G1, G2 값은?", code: `SELECT DEPTNO, JOB, SUM(SAL),
       GROUPING(DEPTNO) AS G1,
       GROUPING(JOB)    AS G2
FROM   EMP
GROUP  BY ROLLUP(DEPTNO, JOB);`, a: "부서별 소계: G1 = 0, G2 = 1 / 총계: G1 = 1, G2 = 1", why: "부서별 소계는 JOB만 집계되어 빠졌다. 총계는 둘 다 빠졌다." },
        l: ["grp-rollup", "fn-case"]
      }
    ]
  },
  {
    id: "p2c2s4", label: "SECTION 04", title: "윈도우 함수", level: "중",
    nodes: [
      {
        id: "win-syntax", t: "윈도우 함수의 구조",
        c: "행과 행 사이의 관계를 계산한다. GROUP BY와 달리 행 수를 줄이지 않고 각 행 옆에 결과를 붙인다.",
        m: ["`함수(인자) OVER (PARTITION BY 칼럼 ORDER BY 칼럼 윈도우절)`", "**OVER**는 필수", "**PARTITION BY**: 계산할 그룹을 나눈다(생략하면 전체가 한 그룹)", "**ORDER BY**: 그룹 안에서의 순서", "**윈도우절**(ROWS / RANGE): 계산에 포함할 행 범위"],
        k: ["종류: 순위(RANK, DENSE_RANK, ROW_NUMBER), 집계(SUM, AVG, MAX, MIN, COUNT), 행 순서(FIRST_VALUE, LAST_VALUE, LAG, LEAD), 비율(PERCENT_RANK, CUME_DIST, NTILE, RATIO_TO_REPORT)."],
        x: ["윈도우 함수는 **WHERE 절에 쓸 수 없다**. 결과로 거르려면 인라인 뷰로 감싼다.", "PARTITION BY는 GROUP BY처럼 나누지만 **행을 합치지 않는다**."],
        q: { q: "EMP는 14행이고 부서는 3개다. 결과 행 수는?", code: `SELECT ENAME, DEPTNO,
       SUM(SAL) OVER (PARTITION BY DEPTNO) AS DEPT_SUM
FROM   EMP;`, a: "14행", why: "윈도우 함수는 행 수를 줄이지 않는다. 각 사원 옆에 자기 부서 합계가 붙는다." },
        l: ["fn-single", "win-rank", "win-agg", "group-by"]
      },
      {
        id: "win-rank", t: "순위 함수 (RANK · DENSE_RANK · ROW_NUMBER)",
        c: "정렬 순서대로 순위를 매긴다. 같은 값(동점)을 처리하는 방식이 다르다.",
        m: ["`RANK`: 동점은 같은 순위, 다음 순위를 **건너뛴다** → 1, 2, 2, 4", "`DENSE_RANK`: 동점은 같은 순위, 다음 순위를 **건너뛰지 않는다** → 1, 2, 2, 3", "`ROW_NUMBER`: 동점이어도 **고유한 번호** → 1, 2, 3, 4"],
        k: ["DENSE는 '빽빽한'이라는 뜻이다. 순위에 빈칸이 없다.", "순위 함수는 OVER 안에 ORDER BY가 반드시 있어야 한다."],
        x: ["ROW_NUMBER에서 동점 행의 순서는 정해져 있지 않다. 정하려면 ORDER BY에 칼럼을 더 넣는다.", "Oracle에서 `ORDER BY SAL DESC`면 SAL이 NULL인 행이 1등이 된다."],
        q: { q: "SAL이 5000, 3000, 3000, 2000인 네 행의 세 함수 결과는?", code: `SELECT SAL,
       RANK()       OVER (ORDER BY SAL DESC) AS R1,
       DENSE_RANK() OVER (ORDER BY SAL DESC) AS R2,
       ROW_NUMBER() OVER (ORDER BY SAL DESC) AS R3
FROM   EMP;`, a: "R1: 1, 2, 2, 4 / R2: 1, 2, 2, 3 / R3: 1, 2, 3, 4", why: "RANK는 동점 다음 순위를 건너뛰고, DENSE_RANK는 이어서 매기고, ROW_NUMBER는 무조건 연속 번호다." },
        l: ["win-syntax", "topn-rownum", "order-null"]
      },
      {
        id: "win-agg", t: "집계 윈도우 함수와 누적 합계",
        c: "SUM, AVG, MAX, MIN, COUNT에 OVER를 붙이면 행을 합치지 않고 그룹별·누적 집계를 낸다.",
        m: ["`SUM(SAL) OVER ()`: 전체 합계", "`SUM(SAL) OVER (PARTITION BY DEPTNO)`: 부서별 합계", "`SUM(SAL) OVER (ORDER BY SAL)`: **누적 합계**"],
        k: ["OVER 안에 ORDER BY만 쓰면 기본 범위가 `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`다. 처음부터 현재 행까지다."],
        x: ["기본값이 RANGE이기 때문에 **정렬 값이 같은 행은 한꺼번에 더해진다**. 한 행씩 누적하려면 `ROWS`를 명시한다."],
        q: { q: "SAL이 100, 200, 200, 300인 네 행에서 C1과 C2는?", code: `SELECT SAL,
       SUM(SAL) OVER (ORDER BY SAL) AS C1,
       SUM(SAL) OVER (ORDER BY SAL
                      ROWS BETWEEN UNBOUNDED PRECEDING
                               AND CURRENT ROW) AS C2
FROM   EMP;`, a: "C1: 100, 500, 500, 800 / C2: 100, 300, 500, 800", why: "C1은 기본 RANGE라서 값이 같은 200 두 행이 함께 더해진다. C2는 ROWS라서 한 행씩 누적한다." },
        l: ["win-syntax", "win-frame", "agg-fn"]
      },
      {
        id: "win-frame", t: "윈도우절 (ROWS와 RANGE)",
        c: "현재 행을 기준으로 어디부터 어디까지 계산에 넣을지 정한다.",
        m: ["`ROWS`: **행 개수** 기준(물리적)", "`RANGE`: **값의 범위** 기준(논리적). 같은 값은 함께 포함", "`UNBOUNDED PRECEDING`: 첫 행, `n PRECEDING`: n행(값) 앞", "`CURRENT ROW`: 현재 행", "`n FOLLOWING`: n행(값) 뒤, `UNBOUNDED FOLLOWING`: 마지막 행"],
        k: ["`BETWEEN 시작 AND 끝`에서 시작은 끝보다 앞이어야 한다.", "`ROWS 1 PRECEDING`처럼 BETWEEN 없이 쓰면 끝은 CURRENT ROW다."],
        x: ["ORDER BY가 없으면 범위는 파티션 전체다. ORDER BY가 있으면 기본이 '처음 ~ 현재 행'이다."],
        q: { q: "SAL이 100, 200, 300, 400인 네 행의 결과는?", code: `SELECT SAL,
       SUM(SAL) OVER (ORDER BY SAL
                      ROWS BETWEEN 1 PRECEDING
                               AND 1 FOLLOWING) AS S
FROM   EMP;`, a: "300, 600, 900, 700", why: "앞 한 행 + 현재 행 + 뒤 한 행. 첫 행은 앞이 없고(100 + 200), 마지막 행은 뒤가 없다(300 + 400)." },
        l: ["win-agg", "win-lag"]
      },
      {
        id: "win-lag", t: "행 순서 함수 (LAG · LEAD · FIRST_VALUE · LAST_VALUE)",
        c: "같은 그룹 안에서 다른 행의 값을 가져온다.",
        m: ["`LAG(칼럼, n, 기본값)`: **n행 앞**의 값", "`LEAD(칼럼, n, 기본값)`: **n행 뒤**의 값", "n을 생략하면 1, 해당 행이 없으면 기본값(생략하면 **NULL**)", "`FIRST_VALUE(칼럼)`: 범위의 첫 값, `LAST_VALUE(칼럼)`: 범위의 마지막 값"],
        k: ["LAG는 '뒤처진' 이전 행, LEAD는 '앞서가는' 다음 행이다."],
        x: ["`LAST_VALUE`는 기본 범위가 '처음 ~ 현재 행'이라 **현재 행의 값**(동점이면 동점 마지막 행)이 나온다. 전체의 마지막 값을 원하면 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`을 써야 한다.", "FIRST_VALUE, LAST_VALUE, LAG, LEAD는 Oracle과 SQL Server(2012 이상)에서 모두 쓸 수 있다."],
        q: { q: "SAL이 100, 200, 300인 세 행의 결과는?", code: `SELECT SAL,
       LAG(SAL)         OVER (ORDER BY SAL) AS A,
       LEAD(SAL, 1, 0)  OVER (ORDER BY SAL) AS B,
       LAST_VALUE(SAL)  OVER (ORDER BY SAL) AS C
FROM   EMP;`, a: "A: NULL, 100, 200 / B: 200, 300, 0 / C: 100, 200, 300", why: "LAG는 앞 행이 없으면 NULL. LEAD는 기본값 0을 지정했다. LAST_VALUE는 기본 범위 때문에 현재 행 값이 나온다." },
        l: ["win-frame", "win-syntax"]
      },
      {
        id: "win-ratio", t: "비율 함수 (NTILE · PERCENT_RANK · CUME_DIST · RATIO_TO_REPORT)",
        c: "그룹 안에서의 상대적 위치나 비율을 구한다.",
        m: ["`NTILE(n)`: 행을 **n등분**해 조 번호를 매긴다", "`PERCENT_RANK()`: **(순위 - 1) / (전체 행 수 - 1)**. 0 ~ 1", "`CUME_DIST()`: **현재 행 이하의 행 수 / 전체 행 수**. 0 초과 ~ 1", "`RATIO_TO_REPORT(칼럼)`: **값 / 그룹 합계**. 합하면 1"],
        k: ["NTILE에서 나누어떨어지지 않으면 **앞 조부터** 한 행씩 더 가진다. 7행을 3등분하면 3, 2, 2."],
        x: ["PERCENT_RANK는 첫 행이 0, CUME_DIST는 첫 행이 0이 아니다(1 / 전체).", "RATIO_TO_REPORT는 Oracle 함수다. OVER 안에 ORDER BY를 쓸 수 없다."],
        q: { q: "SAL이 서로 다른 4행이다. 급여 오름차순으로 각 행의 P와 C는?", code: `SELECT SAL,
       PERCENT_RANK() OVER (ORDER BY SAL) AS P,
       CUME_DIST()    OVER (ORDER BY SAL) AS C
FROM   EMP;`, a: "P: 0, 0.33, 0.67, 1 / C: 0.25, 0.5, 0.75, 1", why: "P = (순위 - 1) / 3, C = 현재 행까지의 행 수 / 4." },
        l: ["win-rank", "win-syntax"]
      }
    ]
  }
]);
