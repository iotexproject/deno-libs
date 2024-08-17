import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { check } from './sql-parser.ts';

//unit test
function _test() {
  const stmts = [
    {
      sql: '',
      expect: [false, 'statement is empty'],
    },
    {
      sql: 'select * from table1',
      expect: [true, null],
    },
    {
      sql: 'select * from table1 where a = 1; select * from table2',
      expect: [false, 'only allow one statement'],
    },
    {
      sql: 'select * from table1 where a = 1',
      expect: [true, null],
    },
    {
      sql: 'insert into table1 values (1,2)',
      expect: [false, 'only allow select statement'],
    },
    {
      sql: 'update table1 set a = 1',
      expect: [false, 'only allow select statement'],
    },
    {
      sql: 'delete from table;',
      expect: [false, 'only allow select statement'],
    },
    {
      sql: 'delete from table1; select * from table2',
      expect: [false, 'only allow one statement'],
    },
    {
      sql: 'alter table table_name rename to new_table_name',
      expect: [false, 'only allow select statement'],
    },
    {
      sql: 'create table new_table',
      expect: [false, 'only allow select statement'],
    },
  ];

  for (const stmt of stmts) {
    console.log(stmt);

    const [r, e] = check(stmt.sql);
    assertEquals(r, stmt.expect[0]);
    assertEquals(e, stmt.expect[1]);
  }
}

await _test();
