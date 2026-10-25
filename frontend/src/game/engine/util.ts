/**
 * Small shared engine helpers: id generation and email construction.
 */
import type { CompanyState, Email } from '../models/types'

/** Generate the next sequential id like `email_42` and bump the counter. */
export function nextId(state: CompanyState, prefix: string): string {
  const n = state.nextUid
  state.nextUid += 1
  return `${prefix}_${n}`
}

/** Append an info email to the inbox. Sender identity is required. */
export function pushEmail(
  state: CompanyState,
  email: Pick<Email, 'from' | 'fromName' | 'subject' | 'body'> & {
    kind?: Email['kind']
    participantIds?: string[]
  },
): Email {
  const n = state.nextUid
  state.nextUid += 1
  const record: Email = {
    id: `email_${n}`,
    uid: String(n),
    from: email.from,
    fromName: email.fromName,
    subject: email.subject,
    body: email.body,
    day: state.day,
    kind: email.kind ?? 'info',
    choices: [],
    read: false,
    participantIds: email.participantIds ?? [],
  }
  state.emails.push(record)
  return record
}

/** Append a memory to an employee (keeps the most recent 12). */
export function addMemory(state: CompanyState, employeeId: string, text: string): void {
  const employee = state.employees[employeeId]
  if (!employee) return
  employee.memories.push({ day: state.day, text })
  if (employee.memories.length > 12) {
    employee.memories = employee.memories.slice(-12)
  }
}
