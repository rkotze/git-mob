import test from 'ava';
import { validateEmail } from './helpers.js';

test('email validator returns true for valid emails', t => {
  const validEmail = validateEmail('johndoe@aol.org');
  const validEmail2 = validateEmail('john.doe@aol.org');
  const validEmail3 = validateEmail('johndoe@aol.org.com');
  const validEmail4 = validateEmail('johndoe@aol.org');

  t.is(validEmail, true);
  t.is(validEmail2, true);
  t.is(validEmail3, true);
  t.is(validEmail4, true);
});

test('email validator returns false for invalid emails', t => {
  const invalidEmail = validateEmail('johndoe.@aol.org');
  const invalidEmail2 = validateEmail('johndoe@.org');
  const invalidEmail3 = validateEmail('johndoe@aol.c');
  const invalidEmail4 = validateEmail('johndoe@aol');
  const invalidEmail5 = validateEmail('johndoe.aol');

  t.is(invalidEmail, false);
  t.is(invalidEmail2, false);
  t.is(invalidEmail3, false);
  t.is(invalidEmail4, false);
  t.is(invalidEmail5, false);
});
