SQLD.put("p2c3", [
  {
    id: "p2c3s1", label: "SECTION 01", title: "DML", level: "상",
    nodes: [
      {
        id: "dml-insert", t: "INSERT",
        c: "테이블에 새 행을 넣는다.",
        m: ["`INSERT INTO 테이블 (칼럼1, 칼럼2) VALUES (값1, 값2)`", "칼럼 목록을 생략하면 **모든 칼럼**에 테이블 정의 순서대로 값을 넣어야 한다", "`INSERT INTO 테이블 SELECT …`: 조회 결과를 한꺼번에 입력(VALUES를 쓰지 않는다)"],
        k: ["칼럼 목록에 **쓰지 않은 칼럼**에는 DEFAULT 값이 들어가고, DEFAULT가 없으면 NULL이 들어간다."],
        x: ["**NULL을 직접 써 넣으면 DEFAULT가 적용되지 않고 NULL**이 들어간다.", "칼럼 수와 값의 수가 다르면 오류다. NOT NULL 칼럼을 빼먹어도 오류다."],
        q: { q: "두 행의 B 값은?", code: `CREATE TABLE T (
  A NUMBER,
  B VARCHAR2(10) DEFAULT 'X',
  C NUMBER
);
INSERT INTO T (A) VALUES (1);
INSERT INTO T VALUES (2, NULL, 3);`, a: "A = 1인 행은 'X', A = 2인 행은 NULL", why: "칼럼을 생략하면 DEFAULT가 들어가지만, NULL을 명시하면 NULL이 그대로 들어간다." },
        l: ["sql-kind", "ddl-constraint", "tcl-commit"]
      },
      {
        id: "dml-update", t: "UPDATE",
        c: "이미 있는 행의 값을 바꾼다.",
        m: ["`UPDATE 테이블 SET 칼럼1 = 값1, 칼럼2 = 값2 WHERE 조건`", "**WHERE를 생략하면 모든 행**이 바뀐다"],
        k: ["SET 절에 서브쿼리를 쓸 수 있다. 서브쿼리 결과가 없는 행은 **NULL로 바뀌므로** WHERE로 대상 행을 한정해야 한다."],
        x: ["여러 칼럼을 바꿀 때는 쉼표로 잇는다. AND로 잇지 않는다."],
        q: { q: "마지막 SELECT의 결과는?", code: `-- T (A): 1, 2, 3
UPDATE T SET A = A + 1 WHERE A >= 2;
SELECT SUM(A) FROM T;`, a: "8", why: "2와 3만 1씩 늘어 1, 3, 4가 된다." },
        l: ["dml-merge", "tcl-commit"]
      },
      {
        id: "dml-delete", t: "DELETE",
        c: "행을 지운다. 테이블 구조와 저장 공간은 그대로 남는다.",
        m: ["`DELETE FROM 테이블 WHERE 조건`", "**WHERE를 생략하면 모든 행**을 지운다", "DML이므로 COMMIT 전에는 **ROLLBACK으로 되살릴 수 있다**"],
        k: ["Oracle은 `DELETE 테이블`처럼 FROM을 생략할 수 있다."],
        x: ["전체 행을 지워도 TRUNCATE와 달리 저장 공간을 반납하지 않고, 행마다 로그를 남겨 느리다.", "DELETE는 특정 칼럼만 지울 수 없다. 칼럼 값을 비우려면 UPDATE로 NULL을 넣는다."],
        q: { q: "Oracle에서 마지막 SELECT의 결과는?", code: `-- T: 5행 (COMMIT 완료)
DELETE FROM T;
ROLLBACK;
SELECT COUNT(*) FROM T;`, a: "5", why: "DELETE는 DML이라 COMMIT 전에는 ROLLBACK으로 복구된다." },
        l: ["ddl-drop", "tcl-commit"]
      },
      {
        id: "dml-merge", t: "MERGE",
        c: "대상 테이블에 같은 키의 행이 있으면 UPDATE, 없으면 INSERT를 한 문장으로 처리한다.",
        m: ["`MERGE INTO 대상 USING 원본 ON (조건)`", "`WHEN MATCHED THEN UPDATE SET 칼럼 = 값`", "`WHEN NOT MATCHED THEN INSERT (칼럼) VALUES (값)`"],
        k: ["UPDATE와 INSERT 뒤에 **테이블명을 쓰지 않는다**(대상은 이미 MERGE INTO에서 정했다)."],
        x: ["**ON 절에 쓴 칼럼은 UPDATE SET에서 바꿀 수 없다**.", "WHEN MATCHED와 WHEN NOT MATCHED 중 하나만 써도 된다."],
        q: { q: "실행 후 T의 내용은?", code: `-- T (ID, VAL): (1, 10), (2, 20)
-- S (ID, VAL): (2, 200), (3, 300)
MERGE INTO T
USING S ON (T.ID = S.ID)
WHEN MATCHED THEN
  UPDATE SET T.VAL = S.VAL
WHEN NOT MATCHED THEN
  INSERT (ID, VAL) VALUES (S.ID, S.VAL);`, a: "(1, 10), (2, 200), (3, 300)", why: "ID 2는 일치해서 값이 바뀌고, ID 3은 없어서 새로 들어간다. ID 1은 원본에 없어 그대로다." },
        l: ["dml-insert", "dml-update"]
      }
    ]
  },
  {
    id: "p2c3s2", label: "SECTION 02", title: "TCL", level: "상",
    nodes: [
      {
        id: "tcl-acid", t: "트랜잭션의 특성 (ACID)",
        c: "트랜잭션은 한꺼번에 모두 처리되거나 모두 취소되어야 하는 논리적 작업 단위다.",
        m: ["**원자성**(Atomicity): 전부 실행되거나 전혀 실행되지 않는다(All or Nothing)", "**일관성**(Consistency): 실행 전후로 DB가 모순 없는 상태를 유지한다", "**고립성**(Isolation): 실행 중인 트랜잭션은 다른 트랜잭션의 영향을 받지 않는다", "**지속성**(Durability): 성공한 결과는 영구적으로 저장된다"],
        k: ["두문자 '원·일·고·지'. 설명을 주고 어떤 특성인지 고르는 문제로 나온다."],
        x: ["고립성이 약하면 생기는 현상: **Dirty Read**(커밋 안 된 데이터를 읽음), **Non-Repeatable Read**(같은 조회를 다시 했더니 값이 바뀜), **Phantom Read**(다시 조회했더니 없던 행이 생김)."],
        q: { q: "계좌 이체 중 출금만 되고 입금은 되지 않는 일이 없도록 보장하는 트랜잭션 특성은?", a: "원자성", why: "트랜잭션에 포함된 연산은 모두 성공하거나 모두 취소되어야 한다." },
        l: ["model-tx", "tcl-commit"]
      },
      {
        id: "tcl-commit", t: "COMMIT과 ROLLBACK",
        c: "COMMIT은 변경을 확정하고, ROLLBACK은 변경을 취소해 마지막 COMMIT 시점으로 되돌린다.",
        m: ["COMMIT **전**: 변경한 본인만 바뀐 결과를 본다. 다른 사용자는 이전 값을 본다. 변경된 행에는 **잠금(Lock)** 이 걸린다", "COMMIT **후**: 변경이 DB에 영구 반영된다. 모든 사용자가 본다. 잠금이 풀린다", "ROLLBACK: COMMIT하지 않은 변경을 모두 취소하고 잠금을 푼다"],
        k: ["Oracle은 DML 뒤에 **직접 COMMIT**해야 한다. SQL Server는 기본이 **AUTO COMMIT**이라 문장이 성공하면 자동으로 확정된다."],
        x: ["SQL Server에서 여러 문장을 한 트랜잭션으로 묶으려면 `BEGIN TRANSACTION`으로 시작하고 `COMMIT` 또는 `ROLLBACK`으로 끝낸다.", "Oracle은 접속을 정상 종료하면 자동 COMMIT, 비정상 종료하면 자동 ROLLBACK된다."],
        q: { q: "Oracle에서 세션 A가 UPDATE로 SAL을 1000에서 2000으로 바꾸고 아직 COMMIT하지 않았다. 세션 B가 조회하면 얼마가 보이는가?", a: "1000", why: "COMMIT 전의 변경은 다른 사용자에게 보이지 않는다." },
        l: ["tcl-savepoint", "tcl-ddl", "dml-delete", "sql-kind"]
      },
      {
        id: "tcl-savepoint", t: "SAVEPOINT",
        c: "트랜잭션 중간에 저장점을 만들어, 전체가 아니라 그 지점까지만 되돌릴 수 있게 한다.",
        m: ["Oracle: `SAVEPOINT 이름`, `ROLLBACK TO 이름`", "SQL Server: `SAVE TRANSACTION 이름`, `ROLLBACK TRANSACTION 이름`"],
        k: ["`ROLLBACK TO A`를 하면 A **이후에 만든 저장점은 사라진다**. A 자체는 남는다.", "그냥 `ROLLBACK`은 저장점과 무관하게 트랜잭션 전체를 취소한다."],
        x: ["같은 이름으로 저장점을 다시 만들면 **나중에 만든 것**이 유효하다.", "ROLLBACK TO는 트랜잭션을 끝내지 않는다. 그 뒤에 COMMIT이나 ROLLBACK이 필요하다."],
        q: { q: "마지막 SELECT의 결과는?", code: `-- T는 빈 테이블
INSERT INTO T VALUES (1);
SAVEPOINT A;
INSERT INTO T VALUES (2);
SAVEPOINT B;
INSERT INTO T VALUES (3);
ROLLBACK TO A;
INSERT INTO T VALUES (4);
COMMIT;
SELECT COUNT(*) FROM T;`, a: "2 (값 1, 4)", why: "ROLLBACK TO A로 2와 3의 입력이 취소된다. 그 뒤에 넣은 4와 처음의 1이 COMMIT된다." },
        l: ["tcl-commit"]
      },
      {
        id: "tcl-ddl", t: "DDL과 자동 COMMIT",
        c: "Oracle에서 DDL을 실행하면 그 앞에 하던 DML까지 함께 자동으로 COMMIT된다.",
        m: ["**Oracle**: DDL(CREATE, ALTER, DROP, TRUNCATE 등)은 실행과 동시에 **자동 COMMIT**. ROLLBACK할 수 없다", "**SQL Server**: DDL도 트랜잭션 안에 넣을 수 있어 **ROLLBACK할 수 있다**"],
        k: ["문제에 DML → DDL → ROLLBACK 순서가 보이면 Oracle인지 SQL Server인지부터 확인한다."],
        x: ["Oracle에서는 DDL이 실패해도 그 앞의 DML은 이미 COMMIT된 상태다."],
        q: { q: "Oracle에서 마지막 SELECT의 결과는?", code: `-- T는 빈 테이블
INSERT INTO T VALUES (1);
CREATE TABLE T2 (C NUMBER);
INSERT INTO T VALUES (2);
ROLLBACK;
SELECT COUNT(*) FROM T;`, a: "1", why: "CREATE TABLE이 실행되면서 앞의 INSERT(1)가 자동 COMMIT된다. 그 뒤의 INSERT(2)만 ROLLBACK된다." },
        l: ["tcl-commit", "ddl-drop", "sql-kind"]
      }
    ]
  },
  {
    id: "p2c3s3", label: "SECTION 03", title: "DDL", level: "상",
    nodes: [
      {
        id: "ddl-type", t: "데이터 타입",
        c: "칼럼에 저장할 값의 종류와 크기를 정한다.",
        m: ["`CHAR(n)`: **고정 길이** 문자. 남는 자리는 **공백으로 채운다**", "`VARCHAR2(n)`: **가변 길이** 문자. 입력한 만큼만 저장 (SQL Server `VARCHAR`)", "`NUMBER(전체자리, 소수자리)`: 숫자 (SQL Server `NUMERIC`, `INT` 등)", "`DATE`: 날짜와 시각 (SQL Server `DATETIME`)"],
        k: ["길이가 일정한 값(주민번호, 코드)은 CHAR, 길이가 들쭉날쭉한 값(이름, 주소)은 VARCHAR2."],
        x: ["**CHAR끼리** 비교할 때는 짧은 쪽에 공백을 붙여 길이를 맞춘 뒤 비교한다. 'AA'와 'AA '는 같다.", "**VARCHAR2가 한쪽이라도 있으면** 공백도 문자로 본다. 'AA'와 'AA '는 다르다."],
        q: { q: "결과는?", code: `CREATE TABLE T (C1 CHAR(5), C2 VARCHAR2(5));
INSERT INTO T VALUES ('AB', 'AB');
SELECT LENGTH(C1) AS R1, LENGTH(C2) AS R2 FROM T;`, a: "R1 = 5, R2 = 2", why: "CHAR(5)는 남는 세 자리를 공백으로 채워 저장한다. VARCHAR2는 입력한 두 글자만 저장한다." },
        l: ["attr-domain", "fn-conv", "ddl-create"]
      },
      {
        id: "ddl-create", t: "CREATE TABLE",
        c: "테이블을 만든다. 칼럼 이름, 데이터 타입, 제약조건을 정의한다.",
        m: ["테이블명·칼럼명은 **문자로 시작**해야 한다", "쓸 수 있는 문자: **영문자, 숫자, `_`, `$`, `#`**", "예약어는 쓸 수 없다", "한 테이블 안에서 칼럼명은 중복될 수 없다(다른 테이블과는 같아도 된다)"],
        k: ["CTAS: `CREATE TABLE 새테이블 AS SELECT * FROM 원본`. 구조와 데이터를 함께 복사한다. SQL Server는 `SELECT * INTO 새테이블 FROM 원본`."],
        x: ["CTAS로 복사하면 **NOT NULL 제약조건만** 따라온다. PK, UNIQUE, FK, CHECK는 복사되지 않아 다시 만들어야 한다."],
        q: { q: "테이블명으로 쓸 수 있는 것은? EMP_2024 / 2024_EMP / EMP-2024 / EMP 2024", a: "EMP_2024", why: "숫자로 시작할 수 없고, 하이픈과 공백은 쓸 수 없다." },
        l: ["ddl-type", "ddl-constraint", "sql-kind"]
      },
      {
        id: "ddl-constraint", t: "제약조건",
        c: "잘못된 데이터가 들어오지 못하게 막는 규칙이다. 데이터 무결성을 지킨다.",
        m: ["**PRIMARY KEY**: UNIQUE + NOT NULL. **테이블당 하나**(여러 칼럼을 묶을 수는 있다). 고유 인덱스가 자동 생성된다", "**UNIQUE**: 중복 불가. **NULL은 허용**", "**NOT NULL**: NULL 불가", "**CHECK**: 값의 범위나 조건을 제한", "**FOREIGN KEY**: 다른 테이블의 PK(또는 UNIQUE)를 참조. **NULL 허용**, 테이블당 여러 개 가능"],
        k: ["PK와 UNIQUE의 차이는 NULL 허용 여부와 개수 제한이다.", "`DEFAULT`는 제약조건이 아니라 기본값 지정이다."],
        x: ["UNIQUE 칼럼에 NULL을 여러 개 넣는 것은 Oracle에서 가능하다(NULL끼리는 같다고 보지 않는다). SQL Server는 NULL을 한 건만 허용한다.", "CHECK 조건의 결과가 **UNKNOWN이면 통과**한다. `CHECK (AGE >= 20)`인 칼럼에 NULL은 들어간다."],
        q: { q: "Oracle에서 세 INSERT 중 오류가 나는 것은?", code: `CREATE TABLE T (
  ID  NUMBER PRIMARY KEY,
  EML VARCHAR2(30) UNIQUE,
  AGE NUMBER CHECK (AGE >= 20)
);
INSERT INTO T VALUES (1, NULL, NULL);  -- (가)
INSERT INTO T VALUES (2, NULL, 25);    -- (나)
INSERT INTO T VALUES (NULL, 'a', 30);  -- (다)`, a: "(다)만 오류", why: "PK에는 NULL을 넣을 수 없다. UNIQUE는 NULL을 여러 건 허용하고, CHECK는 NULL이면 통과한다." },
        l: ["id-main", "key-kind", "ddl-fk", "null-attr", "attr-domain"]
      },
      {
        id: "ddl-fk", t: "외래키와 참조 동작",
        c: "부모 행을 지우거나 자식 행을 넣을 때, 참조 무결성을 지키기 위해 어떻게 처리할지 정한다.",
        m: ["삭제·수정 시: **CASCADE**(자식도 함께 삭제), **SET NULL**(자식의 FK를 NULL로), **SET DEFAULT**(기본값으로), **RESTRICT**(자식이 있으면 삭제 불가), **NO ACTION**(무결성을 어기면 실행하지 않음)", "입력 시: **AUTOMATIC**(부모가 없으면 부모를 만들고 입력), **DEPENDENT**(부모가 있을 때만 입력), SET NULL, SET DEFAULT, NO ACTION"],
        k: ["`FOREIGN KEY (DEPTNO) REFERENCES DEPT (DEPTNO) ON DELETE CASCADE`처럼 쓴다."],
        x: ["옵션을 지정하지 않으면 자식이 참조하는 부모 행은 지울 수 없다.", "FK 칼럼에는 NULL을 넣을 수 있다. 부모에 없는 값은 넣을 수 없다."],
        q: { q: "EMP.DEPTNO가 DEPT.DEPTNO를 ON DELETE SET NULL로 참조한다. 10번 부서에 사원이 3명 있을 때 결과는?", code: `DELETE FROM DEPT WHERE DEPTNO = 10;`, a: "부서 행은 삭제되고 사원 3명의 DEPTNO가 NULL이 된다", why: "SET NULL은 자식 행을 지우지 않고 FK 값만 NULL로 바꾼다. CASCADE였다면 사원 3명도 삭제된다." },
        l: ["ddl-constraint", "id-rel"]
      },
      {
        id: "ddl-alter", t: "ALTER TABLE",
        c: "이미 만든 테이블의 구조를 바꾼다. Oracle과 SQL Server의 문법이 다르다.",
        m: ["칼럼 추가: Oracle `ADD (칼럼 타입)` / SQL Server `ADD 칼럼 타입`", "칼럼 변경: Oracle **`MODIFY (칼럼 타입)`** / SQL Server **`ALTER COLUMN 칼럼 타입`**", "칼럼 삭제: `DROP COLUMN 칼럼`", "칼럼 이름 변경: Oracle `RENAME COLUMN 옛이름 TO 새이름` / SQL Server `sp_rename`", "제약조건: `ADD CONSTRAINT 이름 제약조건`, `DROP CONSTRAINT 이름`"],
        k: ["새로 추가한 칼럼은 **항상 맨 뒤**에 붙는다. 위치를 지정할 수 없다."],
        x: ["칼럼 크기를 **늘리는 것**은 언제나 가능하다. **줄이는 것**은 데이터가 없거나 NULL만 있을 때(또는 기존 값이 새 크기에 들어갈 때) 가능하다.", "데이터 타입 변경은 칼럼이 NULL만 가질 때 가능하다. NOT NULL 추가는 NULL이 없을 때만 가능하다.", "DEFAULT를 바꾸면 **바꾼 뒤에 입력되는 행부터** 적용된다."],
        q: { q: "Oracle에서 ENAME 칼럼의 길이를 30으로 바꾸는 문장은?\n1) ALTER TABLE EMP ALTER COLUMN ENAME VARCHAR2(30)\n2) ALTER TABLE EMP MODIFY (ENAME VARCHAR2(30))\n3) ALTER TABLE EMP CHANGE ENAME VARCHAR2(30)\n4) MODIFY TABLE EMP (ENAME VARCHAR2(30))", a: "2)", why: "Oracle은 MODIFY, SQL Server는 ALTER COLUMN을 쓴다." },
        l: ["ddl-create", "ddl-drop"]
      },
      {
        id: "ddl-drop", t: "DROP · TRUNCATE · DELETE 비교",
        c: "셋 다 데이터를 없애지만 종류, 범위, 복구 가능 여부가 다르다. 매 시험 나온다.",
        m: ["**DROP**: DDL. 테이블 **자체를 삭제**(구조까지). ROLLBACK 불가", "**TRUNCATE**: DDL. **모든 행 삭제 + 저장 공간 반납**, 구조는 유지. WHERE 불가. ROLLBACK 불가", "**DELETE**: DML. 원하는 행만 삭제 가능. 저장 공간은 유지. **ROLLBACK 가능**"],
        k: ["TRUNCATE는 로그를 거의 남기지 않아 DELETE보다 빠르다.", "`DROP TABLE 테이블 CASCADE CONSTRAINT`: 이 테이블을 참조하는 FK 제약조건까지 함께 삭제(Oracle).", "테이블 이름 변경: `RENAME 옛이름 TO 새이름`(Oracle), `sp_rename`(SQL Server)."],
        x: ["TRUNCATE는 **DDL**이다. Oracle에서는 자동 COMMIT되어 되돌릴 수 없다.", "SQL Server에서는 트랜잭션 안에서 실행한 TRUNCATE를 ROLLBACK할 수 있다."],
        q: { q: "Oracle에서 마지막 SELECT의 결과는?", code: `-- T: 5행 (COMMIT 완료)
TRUNCATE TABLE T;
ROLLBACK;
SELECT COUNT(*) FROM T;`, a: "0", why: "TRUNCATE는 DDL이라 실행 즉시 확정된다. ROLLBACK해도 복구되지 않는다. DELETE였다면 5." },
        l: ["dml-delete", "tcl-ddl", "sql-kind"]
      }
    ]
  },
  {
    id: "p2c3s4", label: "SECTION 04", title: "DCL", level: "하",
    nodes: [
      {
        id: "dcl-grant", t: "GRANT와 REVOKE",
        c: "사용자에게 권한을 주고(GRANT) 회수한다(REVOKE).",
        m: ["`GRANT 권한 ON 객체 TO 사용자`", "`REVOKE 권한 ON 객체 FROM 사용자`", "**객체 권한**: SELECT, INSERT, UPDATE, DELETE, ALTER, INDEX, REFERENCES, EXECUTE", "**시스템 권한**: CREATE SESSION, CREATE TABLE 등(ON 객체 없이 부여)"],
        k: ["GRANT는 **TO**, REVOKE는 **FROM**이다. 전치사를 바꿔 낸 보기가 함정이다."],
        x: ["테이블을 만든 소유자는 그 테이블에 대한 모든 권한을 가진다. 다른 사용자는 권한을 받아야 조회할 수 있다.", "REFERENCES는 그 테이블을 참조하는 FK를 만들 수 있는 권한이다."],
        q: { q: "U1에게 EMP 테이블의 조회와 입력 권한을 주는 문장은?", a: "GRANT SELECT, INSERT ON EMP TO U1;", why: "GRANT 권한 ON 객체 TO 사용자 순서다. 회수는 REVOKE SELECT, INSERT ON EMP FROM U1." },
        l: ["sql-kind", "dcl-option", "dcl-role"]
      },
      {
        id: "dcl-option", t: "WITH GRANT OPTION과 WITH ADMIN OPTION",
        c: "받은 권한을 다른 사용자에게 다시 줄 수 있게 하는 옵션이다. 회수할 때의 동작이 다르다.",
        m: ["`WITH GRANT OPTION`: **객체 권한**에 쓴다. 준 사람의 권한을 회수하면 **그 사람이 나눠 준 권한도 연쇄 회수**된다", "`WITH ADMIN OPTION`: **시스템 권한·롤**에 쓴다. 회수해도 **연쇄 회수되지 않는다**"],
        k: ["'GRANT는 줄줄이 회수, ADMIN은 남는다'로 외운다."],
        q: { q: "A가 B에게 EMP의 SELECT 권한을 WITH GRANT OPTION으로 주었고, B는 C에게 같은 권한을 주었다. A가 B의 권한을 REVOKE하면 C는?", a: "C의 권한도 함께 회수된다", why: "WITH GRANT OPTION으로 전파된 객체 권한은 연쇄적으로 회수된다. WITH ADMIN OPTION이었다면 C의 권한은 남는다." },
        l: ["dcl-grant"]
      },
      {
        id: "dcl-role", t: "ROLE",
        c: "여러 권한을 하나로 묶은 것이다. 사용자에게 권한을 하나씩 주는 대신 롤을 준다.",
        m: ["`CREATE ROLE 롤이름`", "`GRANT 권한 TO 롤이름`", "`GRANT 롤이름 TO 사용자`"],
        k: ["Oracle이 미리 만들어 둔 롤: CONNECT(접속), RESOURCE(객체 생성), DBA(관리자)."],
        x: ["롤에 권한을 추가하면 그 롤을 받은 모든 사용자에게 바로 적용된다.", "롤은 사용자뿐 아니라 다른 롤에도 줄 수 있다."],
        q: { q: "많은 사용자에게 같은 권한 묶음을 반복해서 주는 번거로움을 줄이려고 쓰는 것은?", a: "ROLE", why: "권한을 롤에 모아 두고 롤을 사용자에게 부여한다." },
        l: ["dcl-grant"]
      }
    ]
  }
]);
