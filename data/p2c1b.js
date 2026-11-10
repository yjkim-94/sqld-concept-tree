SQLD.put("p2c1", [
  {
    id: "p2c1s5", label: "SECTION 05", title: "GROUP BY, HAVING 절", level: "상",
    nodes: [
      {
        id: "agg-fn", t: "집계 함수와 NULL",
        c: "여러 행을 묶어 값 하나를 낸다. NULL은 계산에서 빠진다.",
        m: ["`COUNT(*)`: **NULL 포함** 전체 행 수", "`COUNT(칼럼)`: NULL **제외** 행 수", "`SUM, AVG, MAX, MIN`: NULL **제외**하고 계산", "`COUNT(DISTINCT 칼럼)`: 중복과 NULL을 뺀 값의 개수"],
        k: ["AVG의 분모는 **NULL이 아닌 행 수**다. NULL을 0으로 보고 평균 내려면 `AVG(NVL(C, 0))`."],
        x: ["`AVG(C)`와 `SUM(C) / COUNT(*)`는 NULL이 있으면 다르다.", "MAX, MIN은 문자·날짜에도 쓸 수 있다. SUM, AVG는 숫자만."],
        q: { q: "결과는?", code: `-- T (C): 10, NULL, 20, 30
SELECT COUNT(*)          AS R1,
       COUNT(C)          AS R2,
       AVG(C)            AS R3,
       SUM(C) / COUNT(*) AS R4,
       AVG(NVL(C, 0))    AS R5
FROM   T;`, a: "R1 = 4, R2 = 3, R3 = 20, R4 = 15, R5 = 15", why: "AVG(C)는 60 / 3. NULL을 0으로 바꾸면 60 / 4." },
        l: ["null-attr", "fn-null", "group-by", "agg-empty"]
      },
      {
        id: "group-by", t: "GROUP BY 절",
        c: "같은 값을 가진 행끼리 묶어 그룹별로 집계한다.",
        m: ["GROUP BY를 쓰면 SELECT에는 **GROUP BY에 쓴 칼럼과 집계 함수만** 올 수 있다", "GROUP BY 절에는 **별칭을 쓸 수 없다**", "NULL도 하나의 그룹으로 묶인다"],
        k: ["GROUP BY에 쓴 칼럼을 SELECT에 **안 쓰는 것은 괜찮다**. 반대가 오류다."],
        x: ["WHERE는 그룹으로 묶기 **전** 행을 거르고, HAVING은 묶은 **후** 그룹을 거른다.", "집계 함수는 중첩할 수 있다. `MAX(SUM(SAL))`는 그룹별 합계 중 최댓값이며 이때 SELECT에 일반 칼럼을 함께 쓸 수 없다."],
        q: { q: "오류가 나는 것은?\n1) SELECT DEPTNO, COUNT(*) FROM EMP GROUP BY DEPTNO\n2) SELECT COUNT(*) FROM EMP GROUP BY DEPTNO\n3) SELECT DEPTNO, JOB, COUNT(*) FROM EMP GROUP BY DEPTNO\n4) SELECT DEPTNO, MAX(SAL) FROM EMP GROUP BY DEPTNO, JOB", a: "3)", why: "JOB은 GROUP BY에 없고 집계 함수도 아니다. 2)와 4)는 문제없다." },
        l: ["select-order", "having", "agg-fn", "grp-rollup"]
      },
      {
        id: "having", t: "HAVING 절",
        c: "그룹으로 묶은 결과에 조건을 건다. 집계 함수를 조건에 쓸 수 있다.",
        m: ["실행 순서: WHERE(행 필터) → GROUP BY → **HAVING(그룹 필터)**", "HAVING에는 집계 함수나 GROUP BY 칼럼으로 된 조건을 쓴다"],
        k: ["집계와 무관한 조건은 WHERE에 쓰는 것이 낫다. 묶을 행 수가 먼저 줄어든다."],
        x: ["GROUP BY 없이 HAVING만 써도 된다. 전체가 한 그룹이 된다.", "HAVING에서도 SELECT의 별칭은 쓸 수 없다."],
        q: { q: "결과는?", code: `-- EMP (DEPTNO, SAL)
--   10  1000 / 10  2000 / 10  3000
--   20  5000
--   30   500 / 30  2500
SELECT DEPTNO, COUNT(*) AS CNT
FROM   EMP
WHERE  SAL >= 2000
GROUP  BY DEPTNO
HAVING COUNT(*) >= 2;`, a: "1행: DEPTNO 10, CNT 2", why: "WHERE가 먼저 급여 2000 미만을 뺀다. 10번 2명, 20번 1명, 30번 1명이 남고 HAVING에서 10번만 통과한다." },
        l: ["group-by", "where-op", "select-order"]
      },
      {
        id: "agg-empty", t: "조건에 맞는 행이 없을 때의 집계",
        c: "집계할 행이 0건일 때 결과가 0행인지, NULL 한 행인지가 GROUP BY 유무에 따라 달라진다.",
        m: ["GROUP BY **없음**: 결과는 **1행**. `COUNT` → 0, `SUM / AVG / MAX / MIN` → NULL", "GROUP BY **있음**: 결과는 **0행**(공집합)"],
        k: ["NVL로 0을 만들려면 집계 함수 **바깥**에 써야 한다: `NVL(SUM(SAL), 0)`. 행이 없으면 `SUM(NVL(SAL, 0))`도 NULL이다."],
        q: { q: "EMP에 DEPTNO = 99인 행이 없다. 결과는?", code: `SELECT COUNT(*) AS R1, SUM(SAL) AS R2, NVL(SUM(SAL), 0) AS R3
FROM   EMP
WHERE  DEPTNO = 99;`, a: "1행: R1 = 0, R2 = NULL, R3 = 0", why: "GROUP BY가 없으면 행이 없어도 한 행이 나온다. COUNT는 0, SUM은 NULL이다." },
        l: ["agg-fn", "fn-null"]
      }
    ]
  },
  {
    id: "p2c1s6", label: "SECTION 06", title: "ORDER BY 절", level: "중",
    nodes: [
      {
        id: "order-basic", t: "ORDER BY 절",
        c: "결과를 정렬한다. SELECT 문에서 가장 마지막에 실행된다.",
        m: ["`ASC`: 오름차순(**기본값**), `DESC`: 내림차순", "정렬 기준으로 **칼럼명, 별칭, SELECT 목록의 순번**을 쓸 수 있고 섞어 써도 된다", "칼럼마다 ASC / DESC를 따로 지정한다"],
        k: ["`ORDER BY A, B DESC`는 A 오름차순, B 내림차순이다. DESC는 바로 앞 칼럼에만 붙는다.", "ORDER BY가 없으면 출력 순서는 보장되지 않는다."],
        x: ["SELECT에 없는 칼럼으로도 정렬할 수 있다. 단, **DISTINCT나 GROUP BY를 쓴 경우**에는 SELECT에 있는 것(또는 GROUP BY 칼럼·집계 함수)만 가능하다.", "숫자 순번은 SELECT 목록 기준이다. 범위를 벗어나면 오류."],
        q: { q: "출력 순서는?", code: `-- T (NAME, SCORE)
--   A  100
--   B  200
--   C  200
SELECT NAME, SCORE FROM T ORDER BY 2 DESC, 1;`, a: "B 200 → C 200 → A 100", why: "두 번째 칼럼(SCORE) 내림차순, 같으면 첫 번째 칼럼(NAME) 오름차순." },
        l: ["select-order", "order-null", "topn-rownum"]
      },
      {
        id: "order-null", t: "정렬과 NULL",
        c: "NULL을 가장 큰 값으로 볼지 가장 작은 값으로 볼지가 DBMS마다 다르다.",
        m: ["**Oracle**: NULL을 **가장 큰 값**으로 취급 → ASC면 맨 뒤, DESC면 맨 앞", "**SQL Server**: NULL을 **가장 작은 값**으로 취급 → ASC면 맨 앞, DESC면 맨 뒤"],
        k: ["Oracle은 `ORDER BY C NULLS FIRST` / `NULLS LAST`로 위치를 지정할 수 있다."],
        q: { q: "Oracle에서 출력 순서는?", code: `-- T (C): 1, NULL, 3
SELECT C FROM T ORDER BY C DESC;`, a: "NULL → 3 → 1", why: "Oracle은 NULL을 가장 큰 값으로 본다. 내림차순이면 맨 앞에 나온다. SQL Server라면 3 → 1 → NULL." },
        l: ["null-attr", "order-basic", "win-rank"]
      }
    ]
  },
  {
    id: "p2c1s7", label: "SECTION 07", title: "조인", level: "상",
    nodes: [
      {
        id: "join-concept", t: "조인의 개념",
        c: "두 개 이상의 테이블을 연결해 한 번에 조회한다. 보통 PK와 FK의 값이 같은 행끼리 연결한다.",
        m: ["N개 테이블을 조인하려면 조인 조건이 **최소 N - 1개** 필요하다", "조인 조건이 없으면 **카티션 곱**(모든 행의 조합, M × N행)이 된다", "DBMS는 내부적으로 **두 테이블씩** 조인을 처리한다"],
        k: ["양쪽 테이블에 같은 이름의 칼럼이 있으면 `테이블.칼럼`으로 구분해야 한다. 안 하면 '칼럼이 모호하다'는 오류가 난다."],
        x: ["조인 조건은 반드시 PK-FK일 필요는 없다. 논리적으로 연관된 칼럼이면 된다."],
        q: { q: "EMP 14행, DEPT 4행이다. 결과 행 수는?", code: `SELECT * FROM EMP, DEPT;`, a: "56행", why: "조인 조건이 없어 카티션 곱(14 × 4)이 된다." },
        l: ["rel-join", "join-equi", "std-cross", "std-inner"]
      },
      {
        id: "join-equi", t: "등가 조인과 비등가 조인",
        c: "조인 조건에 `=`을 쓰면 등가(EQUI) 조인, 그 밖의 연산자를 쓰면 비등가(Non-EQUI) 조인이다.",
        m: ["**EQUI JOIN**: `=`로 값이 같은 행을 연결. 대부분 PK = FK", "**Non-EQUI JOIN**: `BETWEEN`, `>`, `>=`, `<`, `<=`로 연결. 값이 **범위에 속하는** 행을 연결"],
        k: ["비등가 조인의 대표 예는 급여와 급여등급(최저~최고) 테이블이다."],
        x: ["비등가 조인에서 범위에 속하지 않는 행은 결과에서 빠진다(내부 조인)."],
        q: { q: "결과 행 수는?", code: `-- EMP (SAL): 800, 1500, 3000, 6000
-- GRADE (GRADE, LOSAL, HISAL)
--   1   700  1200
--   2  1201  2000
--   3  2001  5000
SELECT E.SAL, G.GRADE
FROM   EMP E, GRADE G
WHERE  E.SAL BETWEEN G.LOSAL AND G.HISAL;`, a: "3행", why: "6000은 어느 등급 범위에도 속하지 않아 빠진다." },
        l: ["join-concept", "where-op"]
      },
      {
        id: "join-outer-ora", t: "Oracle의 (+) 외부 조인",
        c: "조인 조건에 맞는 상대가 없는 행도 결과에 넣는다. Oracle은 `(+)` 기호로 쓴다.",
        m: ["`(+)`는 **데이터가 없어서 NULL로 채워질 쪽**에 붙인다", "`WHERE D.DEPTNO = E.DEPTNO(+)` → DEPT가 기준(모두 출력), EMP 쪽이 NULL로 채워진다 = `DEPT LEFT OUTER JOIN EMP`"],
        k: ["'(+)가 없는 쪽이 전부 나온다'로 외운다."],
        x: ["`(+)`가 붙은 테이블에 일반 조건을 걸 때 **그 조건에도 (+)를 붙여야** 한다. 안 붙이면 내부 조인과 같은 결과가 된다.", "`(+)`를 양쪽에 다 붙일 수 없다. FULL OUTER JOIN은 표준 조인 문법으로 쓴다."],
        q: { q: "결과 행 수는?", code: `-- DEPT (DEPTNO): 10, 20, 30, 40
-- EMP  (DEPTNO): 10, 10, 20, 30
SELECT D.DEPTNO, E.DEPTNO
FROM   DEPT D, EMP E
WHERE  D.DEPTNO = E.DEPTNO(+);`, a: "5행", why: "일치하는 4행에, 사원이 없는 40번 부서가 EMP 쪽 NULL로 한 행 추가된다." },
        l: ["std-outer", "std-on-where"]
      }
    ]
  },
  {
    id: "p2c1s8", label: "SECTION 08", title: "표준 조인", level: "상",
    nodes: [
      {
        id: "std-inner", t: "INNER JOIN, NATURAL JOIN, USING, ON",
        c: "ANSI 표준 조인은 조인 조건을 FROM 절에 쓴다. 조건을 쓰는 방법이 세 가지다.",
        m: ["`A INNER JOIN B ON 조건`: 조건을 직접 쓴다. INNER는 생략 가능", "`A JOIN B USING (칼럼)`: 이름이 같은 칼럼 중 **지정한 것**으로 등가 조인", "`A NATURAL JOIN B`: 이름이 같은 **모든 칼럼**으로 등가 조인"],
        k: ["`SELECT *` 결과에서 NATURAL JOIN과 USING은 조인 칼럼이 **한 번만**, 맨 앞에 나온다. ON은 양쪽 칼럼이 모두 나온다."],
        x: ["NATURAL JOIN과 USING의 **조인 칼럼에는 테이블명·별칭을 붙일 수 없다**. `E.DEPTNO`라고 쓰면 오류.", "NATURAL JOIN은 ON, USING과 함께 쓸 수 없다.", "SQL Server는 NATURAL JOIN과 USING을 지원하지 않는다."],
        q: { q: "Oracle에서 오류가 나는 것은?\n1) SELECT DEPTNO, E.ENAME FROM EMP E JOIN DEPT D USING (DEPTNO)\n2) SELECT E.DEPTNO, E.ENAME FROM EMP E JOIN DEPT D USING (DEPTNO)\n3) SELECT E.DEPTNO, E.ENAME FROM EMP E JOIN DEPT D ON E.DEPTNO = D.DEPTNO\n4) SELECT DEPTNO, ENAME FROM EMP NATURAL JOIN DEPT", a: "2)", why: "USING에 쓴 조인 칼럼에는 별칭을 붙일 수 없다." },
        l: ["join-concept", "std-outer"]
      },
      {
        id: "std-outer", t: "LEFT · RIGHT · FULL OUTER JOIN",
        c: "기준이 되는 테이블의 행은 조인 상대가 없어도 모두 출력하고, 상대 쪽 칼럼은 NULL로 채운다.",
        m: ["`LEFT OUTER JOIN`: **왼쪽** 테이블이 기준", "`RIGHT OUTER JOIN`: **오른쪽** 테이블이 기준", "`FULL OUTER JOIN`: 양쪽 모두 기준(LEFT와 RIGHT 결과의 합집합, 중복 제거)", "OUTER는 생략 가능"],
        k: ["행 수 계산: INNER 결과 + 기준 쪽에서 짝이 없는 행 수.", "조인 칼럼 값이 **중복**이면 그만큼 행이 늘어난다. 먼저 INNER 행 수부터 센다."],
        x: ["FULL OUTER JOIN은 LEFT와 RIGHT를 `UNION`(UNION ALL 아님)한 것과 같다."],
        q: { q: "INNER / LEFT / RIGHT / FULL OUTER JOIN의 결과 행 수는?", code: `-- A (ID): 1, 2, 3
-- B (ID): 2, 3, 3, 5
SELECT * FROM A (조인 종류) JOIN B ON A.ID = B.ID;`, a: "INNER 3행, LEFT 4행, RIGHT 4행, FULL 5행", why: "INNER: 2가 1건, 3이 2건. LEFT는 A의 1이 추가, RIGHT는 B의 5가 추가, FULL은 둘 다 추가." },
        l: ["join-outer-ora", "std-on-where", "set-op"]
      },
      {
        id: "std-on-where", t: "OUTER JOIN에서 ON 조건과 WHERE 조건",
        c: "같은 조건이라도 ON 절에 쓰느냐 WHERE 절에 쓰느냐에 따라 OUTER JOIN 결과가 달라진다.",
        m: ["**ON 절 조건**: 조인할 **상대를 고르는** 조건. 기준 테이블의 행은 그대로 남는다", "**WHERE 절 조건**: 조인이 끝난 **결과를 거르는** 조건. 기준 테이블의 행도 사라질 수 있다"],
        k: ["OUTER JOIN 뒤 WHERE에 상대 테이블 칼럼 조건을 쓰면, NULL로 채워진 행이 탈락해 **INNER JOIN과 같아진다**."],
        x: ["INNER JOIN에서는 ON에 쓰든 WHERE에 쓰든 결과가 같다. 차이는 OUTER JOIN에서만 난다."],
        q: { q: "(가)와 (나)의 결과 행 수는?", code: `-- A (ID): 1, 2, 3
-- B (ID, VAL): (1, 'X'), (2, 'Y')
-- (가)
SELECT * FROM A LEFT JOIN B
ON     A.ID = B.ID AND B.VAL = 'X';
-- (나)
SELECT * FROM A LEFT JOIN B
ON     A.ID = B.ID
WHERE  B.VAL = 'X';`, a: "(가) 3행, (나) 1행", why: "(가)는 A의 세 행이 모두 남고 ID 1만 B와 연결된다. (나)는 조인 후 VAL = 'X'인 행만 남긴다." },
        l: ["std-outer", "join-outer-ora"]
      },
      {
        id: "std-cross", t: "CROSS JOIN",
        c: "조인 조건 없이 두 테이블의 모든 행을 조합한다. 카티션 곱이다.",
        m: ["결과 행 수 = **M × N**", "`FROM A CROSS JOIN B` = `FROM A, B`(조건 없음)"],
        x: ["CROSS JOIN 뒤에 WHERE로 조인 조건을 쓰면 INNER JOIN과 같은 결과가 된다."],
        q: { q: "A는 3행, B는 4행이다. 결과 행 수는?", code: `SELECT * FROM A CROSS JOIN B;`, a: "12행", why: "모든 조합이므로 3 × 4." },
        l: ["join-concept"]
      }
    ]
  }
]);
