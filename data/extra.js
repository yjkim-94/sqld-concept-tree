// 첫 버전 뒤에 보강한 개념. 각 섹션 끝에 붙는다.

SQLD.add("p1c2s4", [
  {
    id: "null-summary", t: "NULL 총정리",
    c: "NULL은 '모르는 값'이다. 계산하면 NULL, 비교하면 UNKNOWN, 집계에서는 빠진다. 이 세 줄에서 나머지가 모두 나온다.",
    m: ["**산술 연산**: NULL이 끼면 결과는 NULL", "**비교**: `=`, `<>` 결과가 UNKNOWN → WHERE에서 탈락. `IS NULL`로만 찾는다", "**집계 함수**: NULL을 빼고 계산. `COUNT(*)`만 NULL 행도 센다", "**NOT IN**: 목록에 NULL이 있으면 결과 0건", "**정렬**: Oracle은 가장 큰 값, SQL Server는 가장 작은 값", "**GROUP BY · DISTINCT**: NULL끼리 한 그룹(한 건)으로 묶는다", "**UNIQUE 제약**: NULL 허용. **PK**: NULL 불가", "**CHECK 제약**: 결과가 UNKNOWN이면 통과"],
    k: ["문제에 NULL이 보이면 먼저 '행 단위 연산인가, 집계인가, 비교인가'를 가른다.", "바꾸는 함수: `NVL(a, b)`, `NVL2(a, 있으면, 없으면)`, `COALESCE(a, b, …)`. 만드는 함수: `NULLIF(a, b)`."],
    x: ["Oracle은 `''`(빈 문자열)을 NULL로 본다. SQL Server는 빈 문자열과 NULL이 다르다.", "Oracle의 `'A' || NULL`은 'A'다. 산술 연산과 달리 문자열 연결은 NULL을 무시한다.", "조건에 맞는 행이 없을 때 `SUM`은 NULL, `COUNT`는 0이다."],
    q: { q: "결과는?", code: `-- T (A, B)
--   1     10
--   2     NULL
--   NULL  30
SELECT COUNT(*)      AS R1,
       COUNT(A)      AS R2,
       SUM(B)        AS R3,
       AVG(B)        AS R4,
       COUNT(A + B)  AS R5
FROM   T;`, a: "R1 = 3, R2 = 2, R3 = 40, R4 = 20, R5 = 1", why: "AVG(B)는 40 / 2. A + B는 첫 행만 NULL이 아니므로 COUNT가 1이다." },
    l: ["null-attr", "fn-null", "where-null", "agg-fn", "sub-notin", "order-null", "ddl-constraint", "agg-empty"]
  }
]);

SQLD.add("p2c1s1", [
  {
    id: "dbms-diff", t: "Oracle과 SQL Server 차이 총정리",
    c: "같은 일을 하는 문법이 두 DBMS에서 다르다. 보기에 두 문법을 섞어 놓고 고르게 하는 문제가 나온다.",
    m: ["문자열 연결: `||` / `+`", "길이: `LENGTH` / `LEN`, 부분 문자열: `SUBSTR` / `SUBSTRING`", "NULL 대체: `NVL` / `ISNULL`", "현재 시각: `SYSDATE` / `GETDATE()`", "올림: `CEIL` / `CEILING`, 나머지: `MOD(a, b)` / `a % b`", "형변환: `TO_CHAR · TO_NUMBER · TO_DATE` / `CAST · CONVERT`", "상위 N건: `ROWNUM` / `TOP(N)`", "차집합: `MINUS` / `EXCEPT`", "계층: `CONNECT BY` / 재귀 CTE(`WITH`)", "칼럼 변경: `MODIFY` / `ALTER COLUMN`", "이름 변경: `RENAME` / `sp_rename`", "테이블 복사: `CREATE TABLE … AS SELECT` / `SELECT … INTO`", "저장점: `SAVEPOINT`, `ROLLBACK TO` / `SAVE TRANSACTION`, `ROLLBACK TRANSACTION`"],
    k: ["앞이 Oracle, 뒤가 SQL Server다."],
    x: ["**빈 문자열**: Oracle은 NULL로 저장, SQL Server는 빈 문자열 그대로.", "**정렬 시 NULL**: Oracle은 가장 큰 값, SQL Server는 가장 작은 값.", "**COMMIT**: Oracle은 직접 해야 하고, SQL Server는 기본이 자동 커밋.", "**DDL**: Oracle은 자동 커밋되어 ROLLBACK 불가, SQL Server는 트랜잭션 안에서 ROLLBACK 가능.", "**외부 조인 (+)**, **NATURAL JOIN · USING**, **DECODE**, **다중 칼럼 서브쿼리**는 Oracle에서만 된다.", "**테이블 별칭의 AS**: Oracle은 쓸 수 없고 SQL Server는 쓸 수 있다.", "**UNIQUE 칼럼의 NULL**: Oracle은 여러 건, SQL Server는 한 건만."],
    q: { q: "SQL Server 문법만으로 이루어진 것은?\n1) SELECT TOP(3) ENAME + '님', ISNULL(COMM, 0) FROM EMP\n2) SELECT ENAME || '님', NVL(COMM, 0) FROM EMP WHERE ROWNUM <= 3\n3) SELECT TOP(3) ENAME || '님', NVL(COMM, 0) FROM EMP\n4) SELECT ENAME + '님', ISNULL(COMM, 0) FROM EMP WHERE ROWNUM <= 3", a: "1)", why: "TOP, +, ISNULL이 SQL Server 문법이다. 2)는 모두 Oracle 문법이고 3), 4)는 섞여 있다." },
    l: ["select-op", "fn-char", "fn-null", "order-null", "topn-rownum", "topn-top", "set-op", "hier-cte", "ddl-alter", "tcl-ddl", "tcl-commit", "std-inner"]
  }
]);

SQLD.add("p2c1s4", [
  {
    id: "where-char", t: "문자열 비교 규칙",
    c: "문자열은 앞에서부터 한 글자씩 비교한다. 뒤에 붙은 공백을 어떻게 볼지는 양쪽의 데이터 타입에 따라 다르다.",
    m: ["**양쪽 모두 CHAR**: 짧은 쪽 끝에 공백을 붙여 길이를 맞춘 뒤 비교한다. **뒤 공백만 다른 문자열은 같다**", "**한쪽이라도 VARCHAR2**: 공백도 하나의 문자로 본다. 길이가 다르면 **긴 쪽이 크다**", "**상수와 비교**: 상수를 칼럼의 타입에 맞춰 비교한다"],
    k: ["CHAR(4) 칼럼에 'AB'를 넣으면 'AB' 뒤에 공백 두 칸이 붙어 저장된다. `WHERE C = 'AB'`는 상수 쪽에도 공백을 채워 비교하므로 찾아진다."],
    x: ["CHAR 칼럼과 VARCHAR2 칼럼에 똑같이 'AB'를 넣어도, **두 칼럼끼리 비교하면 다르다**. CHAR 쪽에는 공백이 붙어 있기 때문이다.", "대소문자는 구분한다. 'a'와 'A'는 다른 문자다."],
    q: { q: "Oracle에서 (가)와 (나)의 결과 행 수는?", code: `CREATE TABLE T (C1 CHAR(4), C2 VARCHAR2(4));
INSERT INTO T VALUES ('AB', 'AB');
SELECT * FROM T WHERE C1 = C2;     -- (가)
SELECT * FROM T WHERE C1 = 'AB';   -- (나)`, a: "(가) 0행, (나) 1행", why: "(가) C1은 'AB' 뒤에 공백 두 칸이 있고 C2는 VARCHAR2라 공백까지 비교되어 다르다. (나) 상수는 CHAR 방식으로 공백을 채워 비교하므로 같다." },
    l: ["ddl-type", "where-op", "fn-char"]
  }
]);

SQLD.add("p2c1s5", [
  {
    id: "agg-case", t: "집계 함수 안의 CASE",
    c: "집계 함수 안에 CASE를 넣으면 조건에 맞는 행만 세거나 더할 수 있다. 한 번의 조회로 여러 조건의 집계를 나란히 낸다.",
    m: ["조건부 합계: `SUM(CASE WHEN 조건 THEN 값 ELSE 0 END)`", "조건부 건수: `COUNT(CASE WHEN 조건 THEN 1 END)` 또는 `SUM(CASE WHEN 조건 THEN 1 ELSE 0 END)`"],
    k: ["COUNT는 NULL이 아닌 것을 센다. ELSE를 생략하면 조건에 안 맞는 행이 NULL이 되어 세지 않는다."],
    x: ["`COUNT(CASE WHEN 조건 THEN 1 ELSE 0 END)`는 **모든 행을 센다**. 0도 NULL이 아니기 때문이다.", "`SUM(CASE WHEN 조건 THEN 값 END)`은 맞는 행이 하나도 없으면 0이 아니라 NULL이다."],
    q: { q: "SAL이 1000, 2000, 3000인 세 행의 결과는?", code: `SELECT COUNT(CASE WHEN SAL >= 2000 THEN 1 ELSE 0 END) AS R1,
       COUNT(CASE WHEN SAL >= 2000 THEN 1 END)        AS R2,
       SUM(CASE WHEN SAL >= 2000 THEN 1 ELSE 0 END)   AS R3,
       SUM(CASE WHEN SAL >= 5000 THEN SAL END)        AS R4
FROM   EMP;`, a: "R1 = 3, R2 = 2, R3 = 2, R4 = NULL", why: "R1은 0도 값이라 세 행 모두 센다. R4는 조건에 맞는 행이 없어 전부 NULL이므로 합도 NULL이다." },
    l: ["agg-fn", "fn-case", "pivot", "agg-empty"]
  }
]);

SQLD.add("p2c1s7", [
  {
    id: "join-multi", t: "세 개 이상의 테이블 조인과 행 수 세기",
    c: "테이블이 여러 개여도 조인은 두 개씩 차례로 일어난다. 앞의 조인 결과를 하나의 테이블로 보고 다음 테이블과 다시 조인한다.",
    m: ["행 수 세는 순서: 첫 조인의 결과 행을 먼저 적는다 → 각 행이 다음 테이블에서 **몇 건과 짝이 되는지** 곱한다", "짝이 0건이면 INNER JOIN에서는 그 행이 사라지고, OUTER JOIN에서는 1행(NULL)으로 남는다"],
    k: ["1:M 관계에서 M 쪽과 조인하면 행이 늘어난다. 조인 칼럼 값이 **몇 번씩 나오는지** 먼저 센다."],
    x: ["`A LEFT JOIN B … INNER JOIN C …` 순서에서, B에 짝이 없어 NULL로 남은 행은 C와의 INNER JOIN 조건에서 탈락한다. 앞의 LEFT JOIN 효과가 사라진다.", "조인 조건이 하나라도 빠지면 그 테이블과는 카티션 곱이 된다."],
    q: { q: "(가) 모두 INNER JOIN일 때와 (나) 모두 LEFT OUTER JOIN일 때의 결과 행 수는?", code: `-- A (ID): 1, 2
-- B (ID, AID): (10, 1), (11, 1), (12, 2)
-- C (BID): 10, 10, 12
SELECT *
FROM   A
JOIN   B ON B.AID = A.ID
JOIN   C ON C.BID = B.ID;`, a: "(가) 3행, (나) 4행", why: "A와 B의 조인은 3행(B 10, 11, 12). B 10은 C와 2건, B 11은 0건, B 12는 1건. INNER는 2 + 0 + 1 = 3, LEFT는 2 + 1 + 1 = 4." },
    l: ["join-concept", "std-outer", "std-on-where"]
  }
]);

SQLD.add("p2c2s1", [
  {
    id: "sub-scalar", t: "스칼라 서브쿼리",
    c: "SELECT 절에 쓰는 서브쿼리다. 메인쿼리의 행마다 실행되어 값 하나를 돌려준다.",
    m: ["반드시 **한 행, 한 칼럼**만 반환해야 한다", "결과가 **없으면 NULL**", "결과가 **두 건 이상이면 오류**"],
    k: ["짝이 없어도 메인쿼리의 행은 사라지지 않는다. **LEFT OUTER JOIN과 같은 결과**가 된다."],
    x: ["조인으로 바꿀 때 INNER JOIN으로 바꾸면 짝 없는 행이 빠져 결과가 달라진다.", "스칼라 서브쿼리는 SELECT 절 외에 WHERE, ORDER BY 등 값 하나가 올 수 있는 곳에도 쓸 수 있다."],
    q: { q: "EMP는 5행이고 그중 한 명은 DEPTNO가 NULL이다. 결과 행 수와 그 사원의 DNAME은?", code: `SELECT E.ENAME,
       (SELECT D.DNAME FROM DEPT D
        WHERE  D.DEPTNO = E.DEPTNO) AS DNAME
FROM   EMP E;`, a: "5행, 그 사원의 DNAME은 NULL", why: "스칼라 서브쿼리는 짝이 없으면 NULL을 돌려줄 뿐 메인쿼리의 행을 없애지 않는다." },
    l: ["sub-kind", "std-outer", "sub-corr"]
  },
  {
    id: "sub-inline", t: "인라인 뷰",
    c: "FROM 절에 쓰는 서브쿼리다. 그 결과를 테이블처럼 쓴다.",
    m: ["SQL이 실행되는 동안만 존재하는 **동적 뷰**다", "메인쿼리는 인라인 뷰가 **SELECT한 칼럼만** 쓸 수 있다", "**ORDER BY를 쓸 수 있다**(Top-N 쿼리)"],
    k: ["쓰는 경우: 집계한 결과를 다시 조인할 때, 정렬한 뒤 ROWNUM을 붙일 때, 윈도우 함수 결과로 WHERE 조건을 걸 때."],
    x: ["인라인 뷰 안에서 별칭을 붙였으면 바깥에서는 그 별칭으로만 부를 수 있다.", "인라인 뷰에 없는 칼럼을 바깥에서 쓰면 오류다."],
    q: { q: "오류가 나는가?", code: `SELECT A.DEPTNO, A.AVG_SAL, A.JOB
FROM  (SELECT DEPTNO, AVG(SAL) AS AVG_SAL
       FROM   EMP
       GROUP  BY DEPTNO) A;`, a: "오류가 난다", why: "인라인 뷰가 JOB을 SELECT하지 않았으므로 바깥에서 A.JOB을 쓸 수 없다." },
    l: ["sub-kind", "topn-rownum", "win-syntax", "sub-view"]
  }
]);

SQLD.add("p2c2s3", [
  {
    id: "grp-table", t: "그룹 함수 결과 표 직접 채우기",
    c: "ROLLUP과 CUBE 문제는 결과 표를 손으로 써 보면 풀린다. 일반 GROUP BY 행을 먼저 쓰고 소계 행을 하나씩 더한다.",
    m: ["① `GROUP BY A, B`의 결과 행을 쓴다", "② ROLLUP: A별 소계(B가 NULL) → 총계(둘 다 NULL)를 더한다", "③ CUBE: 여기에 B별 소계(A가 NULL)를 더 더한다"],
    k: ["소계 행에서는 집계에서 빠진 칼럼이 **NULL로 표시**된다.", "데이터에 없는 조합은 행이 생기지 않는다. '종류 수의 곱'으로 세지 말고 실제 있는 조합을 센다."],
    x: ["행 수만 묻는 문제에서도 실제 조합 수를 세어야 한다. 부서 2개 × 직무 2개라도 조합이 3개뿐일 수 있다."],
    q: { q: "ROLLUP과 CUBE 각각의 결과 행 수와, ROLLUP의 소계·총계 행은?", code: `-- EMP (DEPTNO, JOB, SAL)
--   10  CLERK  100
--   10  MGR    200
--   20  CLERK  300
SELECT DEPTNO, JOB, SUM(SAL)
FROM   EMP
GROUP  BY ROLLUP(DEPTNO, JOB);   -- 또는 CUBE(DEPTNO, JOB)`, a: "ROLLUP 6행: 조합 3행 + (10, NULL, 300), (20, NULL, 300), (NULL, NULL, 600) / CUBE 8행: 여기에 (NULL, CLERK, 400), (NULL, MGR, 200) 추가", why: "실제 조합은 3개다. ROLLUP은 부서별 소계 2행과 총계 1행, CUBE는 직무별 소계 2행이 더 붙는다." },
    l: ["grp-rollup", "grp-cube", "grp-grouping"]
  }
]);

SQLD.add("p2c2s4", [
  {
    id: "win-partition", t: "PARTITION BY와 ORDER BY를 함께 쓸 때",
    c: "PARTITION BY로 그룹을 나누고, 그 안에서 ORDER BY 순서대로 순위나 누적을 계산한다. 그룹이 바뀌면 계산이 처음부터 다시 시작된다.",
    m: ["순위: `RANK() OVER (PARTITION BY DEPTNO ORDER BY SAL DESC)` → **부서 안에서의** 급여 순위", "누적: `SUM(SAL) OVER (PARTITION BY DEPTNO ORDER BY SAL)` → **부서 안에서의** 누적 합계"],
    k: ["풀이 순서: 먼저 PARTITION BY 칼럼으로 표를 나눠 적는다 → 각 묶음 안에서 ORDER BY대로 줄을 세운다 → 묶음마다 따로 계산한다.", "부서별 1등만 뽑으려면 인라인 뷰에서 순위를 매기고 바깥에서 `WHERE 순위 = 1`로 거른다."],
    x: ["누적 합계에서 정렬 값이 같은 행은 기본 범위(RANGE) 때문에 **같은 누적값**을 가진다.", "OVER 안의 ORDER BY는 계산 순서일 뿐 결과 출력 순서를 보장하지 않는다. 출력 순서는 문장 끝의 ORDER BY로 정한다."],
    q: { q: "각 행의 R과 S는?", code: `-- EMP (DEPTNO, SAL)
--   10  300 / 10  200 / 10  200
--   20  500 / 20  100
SELECT DEPTNO, SAL,
       RANK()   OVER (PARTITION BY DEPTNO ORDER BY SAL DESC) AS R,
       SUM(SAL) OVER (PARTITION BY DEPTNO ORDER BY SAL DESC) AS S
FROM   EMP;`, a: "10번: (300 → R 1, S 300), (200 → R 2, S 700), (200 → R 2, S 700) / 20번: (500 → R 1, S 500), (100 → R 2, S 600)", why: "부서마다 순위와 누적이 새로 시작된다. 10번의 200 두 행은 동점이라 순위도 같고 누적도 함께 더해진다." },
    l: ["win-syntax", "win-rank", "win-agg", "sub-inline"]
  }
]);

SQLD.add("p2c2s6", [
  {
    id: "hier-cte", t: "SQL Server의 재귀 CTE",
    c: "SQL Server에는 CONNECT BY가 없다. WITH 절로 만든 CTE가 자기 자신을 다시 참조하는 방식으로 계층을 전개한다.",
    m: ["**앵커 멤버**: 시작 행을 고르는 첫 번째 SELECT(START WITH에 해당)", "**재귀 멤버**: CTE 자신과 조인해 다음 단계를 찾는 두 번째 SELECT(CONNECT BY에 해당)", "둘을 **UNION ALL**로 잇는다", "재귀 멤버의 결과가 더 이상 없으면 멈춘다"],
    k: ["LEVEL 가상 칼럼이 없으므로 앵커에서 `1 AS LVL`, 재귀에서 `LVL + 1`로 직접 만든다."],
    x: ["결과는 단계 순서(1단계 전부 → 2단계 전부)로 쌓인다. CONNECT BY처럼 한 가지를 끝까지 내려가는 순서가 아니다. 계층 순서로 보려면 정렬용 칼럼을 만들어 ORDER BY 한다.", "UNION이 아니라 UNION ALL이어야 한다."],
    q: { q: "EMP는 (1, NULL), (2, 1), (3, 1), (4, 2)다. 결과 행 수와 가장 큰 LVL은?", code: `WITH CTE AS (
  SELECT EMPNO, MGR, 1 AS LVL
  FROM   EMP
  WHERE  MGR IS NULL
  UNION ALL
  SELECT E.EMPNO, E.MGR, C.LVL + 1
  FROM   EMP E
  JOIN   CTE C ON E.MGR = C.EMPNO
)
SELECT * FROM CTE;`, a: "4행, 가장 큰 LVL은 3", why: "앵커가 1번(LVL 1)을 고르고, 재귀가 2·3번(LVL 2), 다시 4번(LVL 3)을 찾는다. 그다음은 결과가 없어 멈춘다." },
    l: ["hier-query", "dbms-diff", "set-op"]
  }
]);

SQLD.add("p2c3s2", [
  {
    id: "tcl-isolation", t: "격리 수준과 이상 현상",
    c: "여러 트랜잭션이 동시에 실행될 때 서로 얼마나 격리할지 정하는 단계다. 격리를 낮추면 빠르지만 잘못된 데이터를 읽을 수 있다.",
    m: ["**Dirty Read**: 다른 트랜잭션이 **아직 COMMIT하지 않은** 데이터를 읽는다", "**Non-Repeatable Read**: 같은 행을 두 번 읽었는데 그 사이 다른 트랜잭션이 수정·삭제해 **값이 달라진다**", "**Phantom Read**: 같은 조건으로 두 번 읽었는데 **없던 행이 나타난다**", "격리 수준(낮음 → 높음): **READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE**"],
    k: ["단계가 올라갈 때마다 하나씩 막는다. READ COMMITTED는 Dirty Read를, REPEATABLE READ는 Non-Repeatable Read까지, SERIALIZABLE은 Phantom Read까지 막는다.", "Oracle과 SQL Server의 기본 격리 수준은 READ COMMITTED다."],
    x: ["Non-Repeatable Read는 **있던 행의 값**이 바뀌는 것, Phantom Read는 **행의 개수**가 바뀌는 것이다.", "잠금(Lock): 읽을 때 거는 공유 잠금끼리는 함께 걸 수 있고, 변경할 때 거는 배타 잠금은 다른 잠금과 함께 걸 수 없다."],
    q: { q: "트랜잭션 A가 '급여 3000 이상' 조건으로 3건을 조회했다. 그 사이 B가 급여 5000인 사원을 INSERT하고 COMMIT했다. A가 같은 조건으로 다시 조회하니 4건이 나왔다. 어떤 현상인가?", a: "Phantom Read", why: "같은 조건의 조회에서 없던 행이 새로 나타났다. 기존 행의 값이 바뀐 것이라면 Non-Repeatable Read다." },
    l: ["tcl-acid", "tcl-commit"]
  }
]);

SQLD.add("p2c3s3", [
  {
    id: "ddl-integrity", t: "무결성의 종류",
    c: "데이터가 정확하고 일관된 상태를 유지하는 성질이다. 제약조건은 무결성을 지키기 위한 수단이다.",
    m: ["**개체 무결성**: 기본키는 NULL일 수 없고 중복될 수 없다 → PRIMARY KEY", "**참조 무결성**: 외래키 값은 NULL이거나 부모 테이블의 기본키 값이어야 한다 → FOREIGN KEY", "**도메인 무결성**: 칼럼 값은 정해진 타입·범위 안에 있어야 한다 → 데이터 타입, CHECK, DEFAULT, NOT NULL", "**고유 무결성**: 특정 칼럼 값은 행마다 달라야 한다 → UNIQUE"],
    k: ["'PK = 개체', 'FK = 참조', '값의 범위 = 도메인'으로 짝지어 외운다."],
    x: ["참조 무결성은 외래키가 NULL인 것은 허용한다. 부모에 없는 값만 막는다."],
    q: { q: "기본키를 구성하는 칼럼에는 NULL이나 중복된 값을 넣을 수 없다는 규칙은 어떤 무결성인가?", a: "개체 무결성", why: "행 하나하나를 구분할 수 있어야 한다는 규칙이다. PRIMARY KEY 제약조건으로 지킨다." },
    l: ["ddl-constraint", "ddl-fk", "id-main", "attr-domain"]
  },
  {
    id: "ddl-sequence", t: "시퀀스와 IDENTITY",
    c: "중복되지 않는 일련번호를 자동으로 만들어 준다. 인조식별자의 값을 채울 때 쓴다.",
    m: ["Oracle: `CREATE SEQUENCE 이름 START WITH 1 INCREMENT BY 1`", "`이름.NEXTVAL`: 다음 번호를 **발급**한다", "`이름.CURRVAL`: 이 세션에서 **마지막으로 발급받은** 번호를 본다", "SQL Server: 칼럼에 `IDENTITY(시작값, 증가값)`을 지정"],
    k: ["세션에서 NEXTVAL을 한 번도 부르지 않았으면 CURRVAL을 쓸 수 없다(오류)."],
    x: ["발급된 번호는 **ROLLBACK해도 되돌아가지 않는다**. 그래서 번호 중간이 빌 수 있다.", "SQL Server의 IDENTITY 칼럼에는 값을 직접 넣을 수 없다(기본 설정)."],
    q: { q: "마지막 SELECT의 결과는?", code: `CREATE SEQUENCE S START WITH 1 INCREMENT BY 1;
INSERT INTO T VALUES (S.NEXTVAL);
INSERT INTO T VALUES (S.NEXTVAL);
ROLLBACK;
SELECT S.NEXTVAL FROM DUAL;`, a: "3", why: "두 INSERT는 취소되지만 이미 발급된 번호 1과 2는 되돌아가지 않는다." },
    l: ["id-surrogate", "ddl-create", "tcl-commit"]
  }
]);
