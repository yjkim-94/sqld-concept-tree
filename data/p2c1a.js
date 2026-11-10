SQLD.put("p2c1", [
  {
    id: "p2c1s1", label: "SECTION 01", title: "관계형 데이터베이스 개요", level: "하",
    nodes: [
      {
        id: "rdb", t: "데이터베이스와 관계형 DB",
        c: "데이터베이스는 여러 사람이 공유하려고 통합 관리하는 데이터 집합이고, 이를 관리하는 소프트웨어가 DBMS다. 관계형 DB는 데이터를 2차원 표(테이블)로 저장하고 테이블 간 관계로 연결한다.",
        m: ["관계형 DB의 장점: 정규화로 **중복 최소화**, **동시성 관리**와 병행 제어, 제약조건으로 **무결성 보장**, 보안·복구 기능"],
        k: ["관계형 모델은 E.F. Codd가 1970년에 제안했다."],
        q: { q: "데이터를 2차원 테이블 형태로 저장하고 키로 테이블을 연결하는 데이터베이스 유형은?", a: "관계형 데이터베이스(RDB)", why: "계층형·망형과 달리 테이블과 관계로 데이터를 표현한다." },
        l: ["table-term", "sql-kind"]
      },
      {
        id: "table-term", t: "테이블 구조와 용어",
        c: "테이블은 행과 열로 이루어진다. 같은 것을 가리키는 용어가 여럿 있다.",
        m: ["**행** = 로우(Row) = 튜플 = 레코드 = 인스턴스", "**열** = 칼럼(Column) = 속성 = 필드", "**기본키**(PK): 행을 구분하는 열, **외래키**(FK): 다른 테이블의 기본키를 참조하는 열"],
        x: ["모델링 용어와 짝: 엔터티 ↔ 테이블, 속성 ↔ 칼럼, 인스턴스 ↔ 행, 식별자 ↔ 키."],
        q: { q: "테이블의 한 행을 가리키는 용어가 아닌 것은? 튜플 / 레코드 / 필드 / 로우", a: "필드", why: "필드는 열(칼럼)을 가리킨다." },
        l: ["entity-def", "key-kind"]
      },
      {
        id: "sql-kind", t: "SQL 명령어의 종류",
        c: "SQL은 하는 일에 따라 네 종류로 나눈다. 명령어를 주고 종류를 고르는 문제가 매번 나온다.",
        m: ["**DML**(조작): SELECT, INSERT, UPDATE, DELETE, MERGE", "**DDL**(정의): CREATE, ALTER, DROP, RENAME, TRUNCATE", "**DCL**(제어): GRANT, REVOKE", "**TCL**(트랜잭션 제어): COMMIT, ROLLBACK, SAVEPOINT"],
        k: ["**TRUNCATE는 DDL**이다. 데이터를 지우지만 DML이 아니다.", "RENAME도 DDL이다."],
        x: ["DELETE(DML)와 TRUNCATE(DDL)를 섞어 놓은 보기가 함정이다.", "SELECT를 따로 DQL로 분류하기도 한다."],
        q: { q: "다음 중 DDL이 아닌 것은? CREATE / TRUNCATE / RENAME / DELETE", a: "DELETE", why: "DELETE는 DML이다. TRUNCATE와 RENAME은 DDL이다." },
        l: ["dml-insert", "ddl-create", "dcl-grant", "tcl-commit", "ddl-drop"]
      }
    ]
  },
  {
    id: "p2c1s2", label: "SECTION 02", title: "SELECT 문", level: "상",
    nodes: [
      {
        id: "select-order", t: "SELECT 문의 실행 순서",
        c: "작성 순서와 실행 순서가 다르다. 실행 순서를 알면 '어디서 별칭을 쓸 수 있는가' 문제가 풀린다.",
        m: ["작성 순서: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY", "**실행 순서: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY**"],
        k: ["두문자 '프·웨·그·해·셀·오'.", "SELECT가 ORDER BY 바로 앞이므로, SELECT에서 붙인 **별칭은 ORDER BY에서만** 쓸 수 있다."],
        x: ["WHERE, GROUP BY, HAVING에서는 SELECT의 별칭을 쓸 수 없다(아직 SELECT가 실행되기 전이다)."],
        q: { q: "오류가 나는가?", code: `SELECT DEPTNO AS D, COUNT(*) AS CNT
FROM   EMP
WHERE  D = 10
GROUP  BY DEPTNO;`, a: "오류가 난다", why: "WHERE는 SELECT보다 먼저 실행되므로 별칭 D를 알 수 없다. WHERE DEPTNO = 10 으로 써야 한다." },
        l: ["select-alias", "group-by", "having", "order-basic"]
      },
      {
        id: "select-basic", t: "SELECT 기본, DISTINCT",
        c: "SELECT 뒤에 조회할 칼럼을 쓰고 FROM 뒤에 테이블을 쓴다. `*`는 모든 칼럼이다.",
        m: ["`ALL`(기본값): 중복 포함", "`DISTINCT`: 중복 행 제거. **SELECT 바로 뒤에 한 번만** 쓴다", "Oracle은 FROM이 필수라서 테이블이 필요 없을 때 **DUAL** 테이블을 쓴다(SQL Server는 FROM 생략 가능)"],
        k: ["DISTINCT 뒤에 칼럼이 여러 개면 **칼럼 조합**이 같은 행을 중복으로 본다."],
        x: ["`SELECT DISTINCT A, B`는 A만 중복 제거하는 것이 아니다.", "DISTINCT는 NULL도 하나의 값으로 취급해 NULL 행을 한 건으로 줄인다."],
        q: { q: "결과 행 수는?", code: `-- T (A, B)
--   1  X
--   1  X
--   1  Y
--   2  Y
--   2  NULL
--   2  NULL
SELECT DISTINCT A, B FROM T;`, a: "4행", why: "(1,X), (1,Y), (2,Y), (2,NULL). 조합 기준으로 중복을 제거하고 NULL끼리도 한 건이 된다." },
        l: ["select-order", "agg-fn", "set-op"]
      },
      {
        id: "select-alias", t: "별칭(ALIAS)",
        c: "칼럼이나 테이블에 임시 이름을 붙인다.",
        m: ["칼럼 별칭: `칼럼 AS 별칭` 또는 `칼럼 별칭`(AS 생략 가능)", "**공백·특수문자 포함, 대소문자 구분**이 필요하면 **큰따옴표**: `SAL AS \"Annual Sal\"`", "테이블 별칭: `FROM EMP E`"],
        k: ["테이블에 별칭을 붙였으면 그 문장 안에서는 **원래 테이블명 대신 별칭만** 써야 한다."],
        x: ["Oracle은 **테이블 별칭에 AS를 쓸 수 없다**(`FROM EMP AS E`는 오류). SQL Server는 가능하다.", "문자열 값은 작은따옴표, 별칭은 큰따옴표다."],
        q: { q: "Oracle에서 오류가 나는 것은?\n1) SELECT ENAME 이름 FROM EMP\n2) SELECT ENAME AS \"사원 이름\" FROM EMP\n3) SELECT E.ENAME FROM EMP AS E\n4) SELECT E.ENAME FROM EMP E", a: "3)", why: "Oracle은 테이블 별칭 앞에 AS를 허용하지 않는다." },
        l: ["select-order", "self-join"]
      },
      {
        id: "select-op", t: "산술 연산자와 합성 연산자",
        c: "숫자·날짜는 산술 연산자로 계산하고, 문자열은 합성 연산자로 이어 붙인다.",
        m: ["산술 우선순위: **() → *, / → +, -**", "합성 연산자: Oracle `||`, SQL Server `+`", "`CONCAT(a, b)`: Oracle은 인자 **2개만** 가능"],
        k: ["NULL이 포함된 산술 연산 결과는 NULL이다."],
        x: ["Oracle: `'A' || NULL` → `'A'`(NULL을 빈 문자열처럼 처리). SQL Server: `'A' + NULL` → NULL.", "SQL Server에서 `'1' + 1`은 숫자 2가 된다(문자가 숫자로 변환)."],
        q: { q: "Oracle에서 결과는?", code: `SELECT 10 + 20 * 2  AS R1,
       100 + NULL   AS R2,
       'SQL' || NULL || 'D' AS R3
FROM   DUAL;`, a: "R1 = 50, R2 = NULL, R3 = 'SQLD'", why: "곱셈이 먼저다. 산술 연산에 NULL이 있으면 NULL. Oracle의 ||는 NULL을 무시하고 이어 붙인다." },
        l: ["null-attr", "fn-char"]
      }
    ]
  },
  {
    id: "p2c1s3", label: "SECTION 03", title: "함수", level: "상",
    nodes: [
      {
        id: "fn-single", t: "단일행 함수와 다중행 함수",
        c: "내장 함수는 행마다 결과를 하나씩 내는 단일행 함수와, 여러 행을 받아 결과 하나를 내는 다중행 함수로 나뉜다.",
        m: ["**단일행**: 문자형, 숫자형, 날짜형, 변환형, NULL 관련 함수", "**다중행**: 집계 함수, 그룹 함수, 윈도우 함수", "단일행 함수는 SELECT, WHERE, ORDER BY 어디서든 쓸 수 있고 중첩할 수 있다"],
        x: ["다중행 함수 중 집계 함수는 WHERE 절에 쓸 수 없다."],
        q: { q: "단일행 함수가 아닌 것은? SUBSTR / NVL / COUNT / ROUND", a: "COUNT", why: "COUNT는 여러 행을 받아 하나의 결과를 내는 집계 함수(다중행 함수)다." },
        l: ["agg-fn", "win-syntax"]
      },
      {
        id: "fn-char", t: "문자형 함수",
        c: "문자열을 자르고, 바꾸고, 길이를 잰다.",
        m: ["`LOWER / UPPER`: 소문자 / 대문자", "`LENGTH(s)`: 길이 (SQL Server `LEN`)", "`SUBSTR(s, 시작, 개수)`: 부분 문자열 (SQL Server `SUBSTRING`). 시작이 **음수면 뒤에서부터**", "`LTRIM / RTRIM / TRIM`: 앞 / 뒤 / 양쪽 문자 제거(기본은 공백)", "`LPAD(s, 길이, 채울문자) / RPAD`: 왼쪽 / 오른쪽 채우기", "`REPLACE(s, 찾을, 바꿀)`: 바꿀 문자를 생략하면 **삭제**", "`INSTR(s, 찾을)`: 처음 나타나는 위치(없으면 0)"],
        k: ["SUBSTR에서 개수를 생략하면 끝까지다.", "`LTRIM('xxAxx', 'x')`는 왼쪽에서 x가 **아닌 문자가 나올 때까지** 지운다 → 'Axx'."],
        x: ["Oracle `LENGTH('AB  ')` = 4(뒤 공백 포함). SQL Server `LEN('AB  ')` = 2(**뒤 공백 제외**).", "SQL Server의 LTRIM / RTRIM은 공백만 제거한다(지정 문자 제거 불가)."],
        q: { q: "Oracle에서 결과는?", code: `SELECT SUBSTR('SQLD EXAM', -4, 2)  AS R1,
       LTRIM('xxYYxx', 'x')        AS R2,
       LPAD('7', 3, '0')           AS R3,
       REPLACE('ABCABC', 'B')      AS R4,
       INSTR('BANANA', 'A')        AS R5
FROM   DUAL;`, a: "R1 = 'EX', R2 = 'YYxx', R3 = '007', R4 = 'ACAC', R5 = 2", why: "-4는 뒤에서 네 번째 문자 E부터 2글자. LTRIM은 왼쪽 x만. REPLACE의 세 번째 인자를 생략하면 삭제." },
        l: ["select-op", "regexp-fn"]
      },
      {
        id: "fn-num", t: "숫자형 함수",
        c: "반올림, 버림, 올림, 나머지를 구한다. 음수와 자릿수 인자가 함정이다.",
        m: ["`ROUND(n, 자리)`: 반올림. 자리 생략 시 0", "`TRUNC(n, 자리)`: 버림", "`CEIL(n)`: 크거나 같은 **최소 정수** (SQL Server `CEILING`)", "`FLOOR(n)`: 작거나 같은 **최대 정수**", "`MOD(a, b)`: 나머지 (SQL Server `%`)", "`ABS`: 절댓값, `SIGN`: 부호(1, 0, -1), `POWER`, `SQRT`"],
        k: ["자리 인자가 **음수면 정수부**를 처리한다. `ROUND(1234, -2)` = 1200.", "CEIL·FLOOR는 수직선에서 오른쪽·왼쪽 정수로 생각한다. `CEIL(-2.3)` = -2, `FLOOR(-2.3)` = -3."],
        x: ["`TRUNC(-2.7)` = -2(0 쪽으로 버림), `FLOOR(-2.7)` = -3. 음수에서 TRUNC와 FLOOR가 다르다.", "Oracle `MOD(a, 0)`은 a를 반환한다. 나머지의 부호는 피제수(a)를 따른다: `MOD(-7, 3)` = -1."],
        q: { q: "결과는?", code: `SELECT ROUND(1234.567, -2) AS R1,
       TRUNC(1234.567, 1)  AS R2,
       CEIL(-2.3)          AS R3,
       FLOOR(-2.3)         AS R4,
       MOD(7, 3)           AS R5
FROM   DUAL;`, a: "R1 = 1200, R2 = 1234.5, R3 = -2, R4 = -3, R5 = 1", why: "-2는 십의 자리에서 반올림. CEIL은 크거나 같은 최소 정수, FLOOR는 작거나 같은 최대 정수." },
        l: ["fn-single"]
      },
      {
        id: "fn-date", t: "날짜형 함수와 날짜 연산",
        c: "날짜에 숫자를 더하면 날짜, 날짜에서 날짜를 빼면 일수(숫자)가 된다.",
        m: ["`SYSDATE`: 현재 날짜·시각 (SQL Server `GETDATE()`)", "`EXTRACT(YEAR | MONTH | DAY FROM d)`: 연·월·일 추출 (SQL Server `YEAR(d)`, `DATEPART`)", "날짜 + 숫자 = **날짜**(숫자는 일 단위)", "날짜 - 날짜 = **숫자**(일수)", "날짜 + 날짜 = **불가**", "`ADD_MONTHS(d, n)`, `MONTHS_BETWEEN(d1, d2)`, `LAST_DAY(d)`"],
        k: ["1 = 하루. **1/24 = 1시간, 1/24/60 = 1분, 1/24/60/60 = 1초**.", "`SYSDATE + 1/24/60*10` = 10분 뒤."],
        x: ["Oracle의 DATE는 **시·분·초까지** 저장한다. 날짜만 비교하려면 `TRUNC(d)`나 `TO_CHAR`로 시각을 떼어야 한다."],
        q: { q: "결과는?", code: `SELECT TO_CHAR(TO_DATE('2024-03-01', 'YYYY-MM-DD') - 1,
               'YYYY-MM-DD') AS R1,
       TO_DATE('2024-03-10', 'YYYY-MM-DD')
     - TO_DATE('2024-03-01', 'YYYY-MM-DD') AS R2
FROM   DUAL;`, a: "R1 = '2024-02-29', R2 = 9", why: "날짜 - 1은 하루 전(2024년은 윤년). 날짜 - 날짜는 일수." },
        l: ["fn-conv"]
      },
      {
        id: "fn-conv", t: "변환형 함수와 형변환",
        c: "데이터 타입을 바꾼다. 함수로 직접 바꾸면 명시적, DBMS가 알아서 바꾸면 암시적 형변환이다.",
        m: ["`TO_CHAR(숫자 | 날짜, 형식)`: 문자로", "`TO_NUMBER(문자)`: 숫자로", "`TO_DATE(문자, 형식)`: 날짜로", "SQL Server: `CAST(값 AS 타입)`, `CONVERT(타입, 값)`", "날짜 형식: YYYY, MM, DD, HH24, MI, SS"],
        k: ["분은 `MI`다. `MM`은 월이다."],
        x: ["암시적 형변환은 **성능 저하**(칼럼이 변환되면 인덱스를 못 씀)와 **오류**의 원인이다. 명시적 변환을 쓴다.", "Oracle은 문자와 숫자를 비교하면 **문자를 숫자로** 바꾼다. 숫자로 바꿀 수 없는 문자가 있으면 오류가 난다."],
        q: { q: "CODE 칼럼은 VARCHAR2이고 'A01', '100', '200'이 들어 있다. Oracle에서 결과는?", code: `SELECT * FROM T WHERE CODE = 100;`, a: "오류(invalid number)", why: "문자 칼럼을 숫자로 암시적 변환하는데 'A01'은 숫자로 바꿀 수 없다. WHERE CODE = '100' 으로 써야 한다." },
        l: ["fn-date", "ddl-type"]
      },
      {
        id: "fn-null", t: "NULL 관련 함수",
        c: "NULL을 다른 값으로 바꾸거나, 조건에 따라 NULL을 만들어 낸다.",
        m: ["`NVL(a, b)`: a가 NULL이면 b (SQL Server `ISNULL`)", "`NVL2(a, b, c)`: a가 **NULL이 아니면 b**, NULL이면 c", "`NULLIF(a, b)`: a = b면 **NULL**, 다르면 a", "`COALESCE(a, b, c, …)`: NULL이 아닌 **첫 번째** 값"],
        k: ["`NULLIF`는 0으로 나누기 방지에 쓴다: `A / NULLIF(B, 0)`.", "`COALESCE(a, b)`는 `NVL(a, b)`와 같다."],
        x: ["NVL2는 인자 순서가 직관과 반대다. 두 번째가 'NULL이 아닐 때'다.", "Oracle의 `ISNULL`은 없다. SQL Server의 `ISNULL(a, b)`가 NVL과 같다(`IS NULL` 조건과 혼동 주의)."],
        q: { q: "결과는?", code: `SELECT NVL2(NULL, 'A', 'B')        AS R1,
       NULLIF(5, 5)                AS R2,
       COALESCE(NULL, NULL, 7, 8)  AS R3,
       NVL(NULLIF('X', 'X'), 'Z')  AS R4
FROM   DUAL;`, a: "R1 = 'B', R2 = NULL, R3 = 7, R4 = 'Z'", why: "NVL2는 NULL이면 세 번째. NULLIF는 같으면 NULL. COALESCE는 첫 NOT NULL. R4는 NULLIF가 NULL을 만들고 NVL이 Z로 바꾼다." },
        l: ["null-attr", "where-null", "agg-fn", "fn-case"]
      },
      {
        id: "fn-case", t: "CASE 표현과 DECODE",
        c: "조건에 따라 다른 값을 돌려준다. IF-THEN-ELSE와 같다.",
        m: ["Simple CASE: `CASE 칼럼 WHEN 값1 THEN 결과1 … ELSE 기본 END`", "Searched CASE: `CASE WHEN 조건1 THEN 결과1 … ELSE 기본 END`", "`DECODE(칼럼, 값1, 결과1, 값2, 결과2, 기본)`: **Oracle 전용**, 같은지(=) 비교만 가능"],
        k: ["**ELSE를 생략하면 NULL**이다.", "WHEN은 위에서부터 검사하고 **처음 참인 것**에서 끝난다."],
        x: ["범위 조건을 쓸 때 순서가 중요하다. `WHEN SAL >= 1000`을 먼저 쓰면 5000도 거기서 걸린다.", "DECODE는 NULL끼리 같다고 본다. `DECODE(NULL, NULL, 'Y', 'N')` → 'Y'."],
        q: { q: "SAL이 500, 2000, 4000인 세 행의 결과는?", code: `SELECT SAL,
       CASE WHEN SAL >= 1000 THEN 'B'
            WHEN SAL >= 3000 THEN 'A'
       END AS GRADE
FROM   EMP;`, a: "500 → NULL, 2000 → 'B', 4000 → 'B'", why: "4000은 첫 조건(>= 1000)에서 먼저 걸려 'B'가 된다. 500은 맞는 조건이 없고 ELSE가 없어 NULL." },
        l: ["fn-null", "pivot"]
      }
    ]
  },
  {
    id: "p2c1s4", label: "SECTION 04", title: "WHERE 절", level: "상",
    nodes: [
      {
        id: "where-op", t: "비교 연산자와 SQL 연산자",
        c: "WHERE 절은 조건에 맞는 행만 걸러 낸다. FROM 다음, GROUP BY 전에 실행된다.",
        m: ["비교: `=`, `>`, `>=`, `<`, `<=`", "부정: `<>`, `!=`, `^=`, `NOT 칼럼 = 값`", "`BETWEEN a AND b`: a 이상 b 이하(**양 끝 포함**)", "`IN (값1, 값2, …)`: 목록 중 하나와 일치(OR)", "`LIKE`: 패턴 일치", "`IS NULL / IS NOT NULL`"],
        k: ["`BETWEEN 10 AND 20`은 `>= 10 AND <= 20`과 같다. `NOT BETWEEN`은 `< 10 OR > 20`."],
        x: ["`BETWEEN 20 AND 10`처럼 큰 값을 앞에 쓰면 결과가 없다.", "WHERE 절에는 **집계 함수를 쓸 수 없다**."],
        q: { q: "SAL이 1000, 2000, 3000, 4000인 네 행에서 결과 행 수는?", code: `SELECT * FROM EMP
WHERE  SAL BETWEEN 2000 AND 4000
AND    SAL NOT IN (3000);`, a: "2행 (2000, 4000)", why: "BETWEEN은 양 끝을 포함하므로 2000, 3000, 4000. 여기서 3000을 뺀다." },
        l: ["where-logic", "where-like", "where-null", "having"]
      },
      {
        id: "where-logic", t: "논리 연산자와 우선순위",
        c: "조건을 AND, OR, NOT으로 묶는다. 괄호가 없으면 정해진 순서대로 계산된다.",
        m: ["우선순위: **괄호 → 비교·SQL 연산자 → NOT → AND → OR**"],
        k: ["'NOT·AND·OR' 순서만 외우면 된다. **AND가 OR보다 먼저**다.", "OR 조건을 먼저 묶으려면 반드시 괄호를 친다."],
        x: ["`A OR B AND C`는 `A OR (B AND C)`다. `(A OR B) AND C`가 아니다."],
        q: { q: "결과 행 수는?", code: `-- EMP (ENAME, DEPTNO, SAL)
--   A  10  1000
--   B  20  3000
--   C  30  3000
--   D  10  5000
SELECT * FROM EMP
WHERE  DEPTNO = 10 OR DEPTNO = 20 AND SAL >= 3000;`, a: "3행 (A, B, D)", why: "AND가 먼저다. DEPTNO = 10 OR (DEPTNO = 20 AND SAL >= 3000). 10번 부서는 급여와 무관하게 모두 나온다." },
        l: ["where-op"]
      },
      {
        id: "where-like", t: "LIKE와 와일드카드",
        c: "문자열이 특정 패턴과 맞는지 검사한다.",
        m: ["`%`: **0개 이상**의 임의 문자", "`_`: **정확히 1개**의 임의 문자", "`ESCAPE`: 와일드카드 문자를 글자 그대로 찾을 때 쓴다"],
        k: ["`LIKE 'A%'` A로 시작, `LIKE '%A'` A로 끝, `LIKE '%A%'` A 포함, `LIKE '_A%'` 두 번째 글자가 A."],
        x: ["`_`나 `%` 자체를 찾으려면 `LIKE 'A#_%' ESCAPE '#'`처럼 쓴다. `#` 다음 문자는 일반 문자로 본다.", "와일드카드 없이 `LIKE 'A'`는 `= 'A'`와 같다."],
        q: { q: "결과 행 수는?", code: `-- ENAME: SMITH, ADAMS, BLAKE, ALLEN, JAMES
SELECT * FROM EMP WHERE ENAME LIKE '_A%';`, a: "1행 (JAMES)", why: "두 번째 글자가 A인 이름만 해당한다. ADAMS, ALLEN은 첫 글자가 A다." },
        l: ["where-op", "regexp-meta"]
      },
      {
        id: "where-null", t: "NULL 조건",
        c: "NULL은 비교 연산자로 찾을 수 없다. 반드시 IS NULL, IS NOT NULL을 쓴다.",
        m: ["`칼럼 = NULL`, `칼럼 <> NULL` → 결과가 항상 **UNKNOWN**이라 한 건도 나오지 않는다", "WHERE는 조건이 **TRUE인 행만** 통과시킨다(FALSE와 UNKNOWN은 탈락)"],
        k: ["`칼럼 <> 값` 조건에서 **NULL인 행은 빠진다**. NULL도 포함하려면 `OR 칼럼 IS NULL`을 붙인다."],
        x: ["3값 논리: `TRUE AND UNKNOWN` = UNKNOWN, `FALSE AND UNKNOWN` = FALSE, `TRUE OR UNKNOWN` = TRUE, `FALSE OR UNKNOWN` = UNKNOWN.", "Oracle은 `''`을 NULL로 보므로 `WHERE C = ''`은 아무것도 찾지 못한다."],
        q: { q: "각각 결과 행 수는?", code: `-- T (C): 1, 2, NULL
SELECT * FROM T WHERE C <> 1;      -- (가)
SELECT * FROM T WHERE C = NULL;    -- (나)
SELECT * FROM T WHERE C IS NULL;   -- (다)`, a: "(가) 1행, (나) 0행, (다) 1행", why: "(가) NULL <> 1은 UNKNOWN이라 2만 나온다. (나) = NULL은 항상 UNKNOWN." },
        l: ["null-attr", "fn-null", "sub-notin", "order-null"]
      }
    ]
  }
]);
