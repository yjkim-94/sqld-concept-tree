SQLD.put("p2c2", [
  {
    id: "p2c2s5", label: "SECTION 05", title: "TOP-N 쿼리", level: "중",
    nodes: [
      {
        id: "topn-rownum", t: "ROWNUM (Oracle)",
        c: "결과 행에 차례로 붙는 임시 번호다. 조건을 통과한 행에만 1부터 번호가 붙는다.",
        m: ["`WHERE ROWNUM <= N`, `WHERE ROWNUM < N`, `WHERE ROWNUM = 1`은 가능", "`WHERE ROWNUM = 2`, `WHERE ROWNUM > 1`은 **결과가 없다**"],
        k: ["ROWNUM은 **ORDER BY보다 먼저** 붙는다. 정렬한 뒤 상위 N건을 뽑으려면 **인라인 뷰에서 먼저 정렬**하고 바깥에서 ROWNUM 조건을 건다."],
        x: ["`WHERE ROWNUM <= 3 ORDER BY SAL DESC`는 급여 상위 3명이 아니다. 아무 3행을 뽑은 뒤 그 3행을 정렬한 것이다.", "ROWNUM = 2가 안 되는 이유: 첫 행이 1번을 받아야 하는데 조건(= 2)에서 탈락하므로 다음 행이 다시 1번 후보가 된다."],
        q: { q: "급여 상위 3명을 구하는 올바른 SQL은?", code: `-- (가)
SELECT ENAME, SAL FROM EMP
WHERE  ROWNUM <= 3
ORDER  BY SAL DESC;
-- (나)
SELECT ENAME, SAL
FROM  (SELECT ENAME, SAL FROM EMP ORDER BY SAL DESC)
WHERE  ROWNUM <= 3;`, a: "(나)", why: "(가)는 정렬 전에 임의의 3행을 먼저 뽑는다. (나)는 정렬된 결과에 ROWNUM을 붙인다." },
        l: ["topn-top", "topn-fetch", "win-rank", "sub-kind", "order-basic"]
      },
      {
        id: "topn-top", t: "TOP 절 (SQL Server)",
        c: "SELECT 바로 뒤에 써서 상위 N건만 출력한다.",
        m: ["`SELECT TOP(N) 칼럼 FROM 테이블 ORDER BY …`", "`TOP(N) PERCENT`: 상위 N퍼센트", "`TOP(N) WITH TIES`: N번째와 **동점인 행도 함께** 출력"],
        k: ["WITH TIES는 **ORDER BY가 있어야** 쓸 수 있다."],
        x: ["TOP은 ORDER BY로 정렬한 **뒤에** 적용된다. Oracle의 ROWNUM과 반대다."],
        q: { q: "SAL이 5000, 3000, 3000, 2000인 네 행이다. 결과 행 수는?", code: `SELECT TOP(2) WITH TIES ENAME, SAL
FROM   EMP
ORDER  BY SAL DESC;`, a: "3행", why: "2번째 행의 급여 3000과 동점인 행이 하나 더 있어 함께 출력된다. WITH TIES가 없으면 2행." },
        l: ["topn-rownum", "topn-fetch"]
      },
      {
        id: "topn-fetch", t: "ROW LIMITING 절 (OFFSET · FETCH)",
        c: "ANSI 표준 방식의 Top-N 쿼리다. ORDER BY 뒤에 쓴다. Oracle 12c, SQL Server 2012부터 지원한다.",
        m: ["`OFFSET n ROWS`: 앞의 **n행을 건너뛴다**", "`FETCH FIRST n ROWS ONLY`: n행만 가져온다(FIRST 대신 NEXT도 같다)", "`FETCH FIRST n ROWS WITH TIES`: 동점 행 포함", "`FETCH FIRST n PERCENT ROWS ONLY`: 비율로 지정"],
        k: ["페이지 처리에 쓴다. `OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY` → 11번째부터 20번째."],
        x: ["SQL Server에서는 OFFSET 없이 FETCH만 쓸 수 없다."],
        q: { q: "SAL이 5000, 4000, 3000, 2000, 1000인 다섯 행이다. 결과는?", code: `SELECT SAL FROM EMP
ORDER  BY SAL DESC
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;`, a: "3000, 2000", why: "정렬 후 앞의 두 행(5000, 4000)을 건너뛰고 다음 두 행을 가져온다." },
        l: ["topn-rownum", "topn-top"]
      }
    ]
  },
  {
    id: "p2c2s6", label: "SECTION 06", title: "계층형 질의와 셀프 조인", level: "중",
    nodes: [
      {
        id: "hier-query", t: "계층형 질의 (START WITH · CONNECT BY)",
        c: "한 테이블 안에 상위·하위 관계가 있는 데이터를 위에서 아래로(또는 반대로) 따라가며 조회한다. Oracle 문법이다.",
        m: ["`START WITH 조건`: 전개를 **시작할 행**(루트)", "`CONNECT BY 조건`: 다음에 읽을 행을 정하는 **연결 조건**", "`PRIOR`: **방금 읽은 행**의 칼럼을 뜻한다"],
        k: ["**`PRIOR 자식(사번) = 부모(관리자사번)`** → **순방향**(위에서 아래로).", "**`PRIOR 부모(관리자사번) = 자식(사번)`** → **역방향**(아래에서 위로).", "풀이: `PRIOR EMPNO = MGR`은 '방금 읽은 행의 사번을 관리자로 가진 행을 다음에 읽어라', 즉 부하 직원으로 내려간다."],
        x: ["PRIOR는 등호 어느 쪽에 써도 된다. `MGR = PRIOR EMPNO`도 순방향이다. **PRIOR가 붙은 칼럼**을 봐야 한다.", "결과는 한 가지를 끝까지 내려간 뒤 형제로 넘어가는 순서(깊이 우선)로 나온다.", "SQL Server는 CONNECT BY가 없어 `WITH` 절 재귀 CTE(앵커 멤버 UNION ALL 재귀 멤버)로 쓴다."],
        q: { q: "출력되는 EMPNO 순서와 각 LEVEL은?", code: `-- EMP (EMPNO, MGR)
--   1  NULL
--   2  1
--   3  1
--   4  2
SELECT EMPNO, LEVEL
FROM   EMP
START  WITH MGR IS NULL
CONNECT BY PRIOR EMPNO = MGR;`, a: "1 (LEVEL 1) → 2 (LEVEL 2) → 4 (LEVEL 3) → 3 (LEVEL 2)", why: "순방향 전개다. 1에서 시작해 부하 2로 내려가고, 2의 부하 4까지 간 뒤 형제 3으로 넘어간다." },
        l: ["rel-hier", "hier-func", "hier-where", "self-join"]
      },
      {
        id: "hier-func", t: "계층형 질의의 가상 칼럼과 함수",
        c: "계층을 전개하면서 깊이, 리프 여부, 경로 같은 정보를 얻는다.",
        m: ["`LEVEL`: 깊이. **루트가 1**", "`CONNECT_BY_ISLEAF`: 자식이 없는 **리프면 1**, 아니면 0", "`CONNECT_BY_ROOT 칼럼`: 루트 행의 칼럼 값", "`SYS_CONNECT_BY_PATH(칼럼, '구분자')`: 루트부터 현재 행까지의 경로", "`ORDER SIBLINGS BY`: **같은 부모를 가진 형제끼리만** 정렬", "`NOCYCLE`: 순환이 생기면 그 지점에서 전개를 멈춘다, `CONNECT_BY_ISCYCLE`: 순환이면 1"],
        k: ["들여쓰기 출력: `LPAD(' ', 2 * (LEVEL - 1)) || ENAME`."],
        x: ["그냥 `ORDER BY`를 쓰면 계층 구조가 깨진다. 계층을 유지하려면 `ORDER SIBLINGS BY`를 쓴다.", "CONNECT_BY_ISCYCLE은 NOCYCLE을 썼을 때만 쓸 수 있다."],
        q: { q: "위 EMP 데이터(1 → 2 → 4, 1 → 3)를 순방향으로 전개했을 때 CONNECT_BY_ISLEAF가 1인 EMPNO는?", a: "3, 4", why: "자식이 없는 행이 리프다. 1과 2는 부하가 있다." },
        l: ["hier-query"]
      },
      {
        id: "hier-where", t: "계층형 질의의 조건 위치",
        c: "같은 조건이라도 WHERE 절에 쓰느냐 CONNECT BY 절에 쓰느냐에 따라 결과가 다르다.",
        m: ["실행 순서: **START WITH → CONNECT BY → WHERE**", "**WHERE 조건**: 전개가 끝난 뒤 **그 행만** 뺀다. 그 행의 자식은 남는다", "**CONNECT BY 조건**: 전개 도중에 걸러 **그 행과 하위 전체**가 빠진다(가지치기)"],
        x: ["조인이 있는 경우 조인 조건은 계층 전개보다 먼저 처리된다."],
        q: { q: "EMP는 (1, NULL), (2, 1), (3, 1), (4, 2)다. (가)와 (나)의 결과 행 수는?", code: `-- (가)
SELECT EMPNO FROM EMP
WHERE  EMPNO <> 2
START  WITH MGR IS NULL
CONNECT BY PRIOR EMPNO = MGR;
-- (나)
SELECT EMPNO FROM EMP
START  WITH MGR IS NULL
CONNECT BY PRIOR EMPNO = MGR AND EMPNO <> 2;`, a: "(가) 3행 (1, 4, 3), (나) 2행 (1, 3)", why: "(가)는 전개를 다 한 뒤 2만 뺀다. (나)는 2로 내려가지 못해 그 아래 4도 나오지 않는다." },
        l: ["hier-query"]
      },
      {
        id: "self-join", t: "셀프 조인",
        c: "같은 테이블을 두 번 써서 자기 자신과 조인한다.",
        m: ["같은 테이블이므로 **별칭이 반드시 필요**하다", "칼럼에도 별칭을 붙여 어느 쪽 것인지 구분한다"],
        k: ["사원과 관리자: `FROM EMP E, EMP M WHERE E.MGR = M.EMPNO`. E가 사원, M이 관리자다."],
        x: ["내부 조인이면 관리자가 없는(MGR이 NULL인) 최상위 사원은 결과에서 빠진다. 포함하려면 외부 조인을 쓴다."],
        q: { q: "EMP는 (1, NULL), (2, 1), (3, 1), (4, 2)다. 결과 행 수는?", code: `SELECT E.EMPNO AS 사원, M.EMPNO AS 관리자
FROM   EMP E, EMP M
WHERE  E.MGR = M.EMPNO;`, a: "3행", why: "MGR이 NULL인 1번 사원은 조인 상대가 없어 빠진다. LEFT OUTER JOIN이면 4행." },
        l: ["rel-hier", "hier-query", "select-alias", "std-outer"]
      }
    ]
  },
  {
    id: "p2c2s7", label: "SECTION 07", title: "PIVOT 절과 UNPIVOT 절", level: "중",
    nodes: [
      {
        id: "pivot", t: "PIVOT 절",
        c: "행으로 나열된 값을 열로 돌려 놓는다. 집계 함수가 반드시 들어간다.",
        m: ["`FROM 테이블 PIVOT (집계함수(값칼럼) FOR 기준칼럼 IN (값1, 값2, …))`", "**집계 함수**: 각 칸에 들어갈 값", "**FOR**: 열로 펼칠 기준 칼럼", "**IN**: 열로 만들 값 목록(별칭 가능)"],
        k: ["PIVOT 절에 쓰지 않은 **나머지 칼럼 전부가 GROUP BY 기준**이 된다. 필요한 칼럼만 고른 인라인 뷰를 FROM에 쓴다."],
        x: ["테이블을 그대로 쓰면 EMPNO 같은 칼럼까지 그룹 기준이 되어 행이 거의 줄지 않는다.", "PIVOT 없이 `SUM(CASE WHEN JOB = 'CLERK' THEN SAL END)`로 같은 결과를 만들 수 있다."],
        q: { q: "EMP에 부서가 3개(10, 20, 30)다. 결과의 행 수와 칼럼은?", code: `SELECT *
FROM  (SELECT DEPTNO, JOB, SAL FROM EMP)
PIVOT (SUM(SAL) FOR JOB IN ('CLERK' AS CLERK,
                            'MANAGER' AS MANAGER));`, a: "3행, 칼럼은 DEPTNO, CLERK, MANAGER", why: "PIVOT에 쓰이지 않은 DEPTNO가 그룹 기준이 되어 부서별로 한 행씩 나온다. 해당 직무가 없으면 NULL." },
        l: ["unpivot", "fn-case", "group-by"]
      },
      {
        id: "unpivot", t: "UNPIVOT 절",
        c: "열로 펼쳐진 값을 다시 행으로 내린다. PIVOT의 반대다.",
        m: ["`FROM 테이블 UNPIVOT (값칼럼 FOR 이름칼럼 IN (열1, 열2, …))`", "**값칼럼**: 각 열의 값이 들어갈 새 칼럼", "**이름칼럼**: 원래 열 이름이 들어갈 새 칼럼"],
        k: ["기본은 `EXCLUDE NULLS`다. **값이 NULL인 행은 만들지 않는다**. 포함하려면 `UNPIVOT INCLUDE NULLS (…)`."],
        x: ["IN 절에 나열하는 열들은 데이터 타입이 같아야 한다."],
        q: { q: "결과 행 수는?", code: `-- T (DEPTNO, Q1, Q2)
--   10  100  NULL
--   20  200  300
SELECT *
FROM   T
UNPIVOT (AMT FOR QTR IN (Q1, Q2));`, a: "3행", why: "원래는 2행 × 2열 = 4행이지만 NULL인 값(10번의 Q2)은 기본으로 제외된다. INCLUDE NULLS면 4행." },
        l: ["pivot", "null-attr"]
      }
    ]
  },
  {
    id: "p2c2s8", label: "SECTION 08", title: "정규 표현식", level: "중",
    nodes: [
      {
        id: "regexp-meta", t: "정규 표현식 메타 문자",
        c: "문자열의 규칙(패턴)을 기호로 나타낸 것이다. LIKE보다 복잡한 조건을 표현할 수 있다.",
        m: ["`.` 임의의 **한 문자**", "`^` 문자열의 **시작**, `$` 문자열의 **끝**", "`*` **0회 이상**, `+` **1회 이상**, `?` **0회 또는 1회**", "`{m}` m회, `{m,}` m회 이상, `{m,n}` m회 이상 n회 이하", "`[abc]` 안의 문자 중 하나, `[a-z]` 범위, `[^abc]` **안의 문자가 아닌** 것", "`|` 또는, `()` 묶음", "`\\d` 숫자, `\\w` 영문자·숫자·밑줄, `\\s` 공백"],
        k: ["`^`의 뜻이 두 가지다. 대괄호 **밖**에서는 시작, 대괄호 **안 맨 앞**에서는 부정.", "POSIX 문자 클래스: `[[:digit:]]` 숫자, `[[:alpha:]]` 영문자, `[[:alnum:]]` 영문자·숫자, `[[:space:]]` 공백."],
        x: ["LIKE의 `%`는 정규식의 `.*`, `_`는 `.`에 해당한다.", "수량 기호는 기본이 **탐욕적**이다. 가능한 한 길게 맞춘다. `a.*c`는 'abcabc' 전체와 일치한다."],
        q: { q: "결과 행 수는?", code: `-- T (C): 'A12', 'D5', 'B', 'CAT9', 'a1'
SELECT * FROM T
WHERE  REGEXP_LIKE(C, '^[A-C].*[0-9]$');`, a: "2행 ('A12', 'CAT9')", why: "A~C로 시작하고 숫자로 끝나야 한다. 'D5'는 시작 불일치, 'B'는 끝에 숫자 없음, 'a1'은 대소문자 불일치." },
        l: ["where-like", "regexp-fn"]
      },
      {
        id: "regexp-fn", t: "정규 표현식 함수",
        c: "Oracle은 정규 표현식을 쓰는 함수 다섯 개를 제공한다. 이름에서 REGEXP_를 뺀 것이 하는 일이다.",
        m: ["`REGEXP_LIKE(문자열, 패턴)`: 일치하면 참. **WHERE 절**에 쓴다", "`REGEXP_REPLACE(문자열, 패턴, 바꿀문자)`: 일치 부분을 바꾼다. 바꿀문자를 생략하면 **삭제**", "`REGEXP_SUBSTR(문자열, 패턴, 시작위치, 몇번째)`: 일치하는 부분 문자열", "`REGEXP_INSTR(문자열, 패턴)`: 일치하는 부분의 **시작 위치**", "`REGEXP_COUNT(문자열, 패턴)`: 일치하는 **횟수**"],
        k: ["구분자로 자르기: `REGEXP_SUBSTR('A,B,C', '[^,]+', 1, 2)` → 'B'. 쉼표가 아닌 문자 덩어리 중 두 번째."],
        x: ["REGEXP_LIKE는 참·거짓을 돌려주므로 SELECT 절에 값으로 쓸 수 없다.", "REGEXP_REPLACE는 기본으로 **일치하는 모든 부분**을 바꾼다."],
        q: { q: "결과는?", code: `SELECT REGEXP_SUBSTR('abc123def45', '[0-9]+')   AS R1,
       REGEXP_REPLACE('010-1234-5678', '[^0-9]') AS R2,
       REGEXP_INSTR('abc123', '[0-9]')           AS R3,
       REGEXP_COUNT('banana', 'an')              AS R4
FROM   DUAL;`, a: "R1 = '123', R2 = '01012345678', R3 = 4, R4 = 2", why: "R1은 처음 나오는 숫자 덩어리. R2는 숫자가 아닌 문자를 모두 삭제. R3는 첫 숫자의 위치. R4는 'an'이 두 번." },
        l: ["regexp-meta", "fn-char"]
      }
    ]
  }
]);
