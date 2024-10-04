import { popRandom, randomInt } from "@/lib/utils";
import { Ticket } from "./types";

export function batchCreateTickets(): Ticket[] {
  const totalBuckets = 9;
  const bucketSize = 10;
  const batchSize = 6;
  const fullTicketSize = 15;

  // Create number buckets
  const buckets: Array<number>[] = Array.from(
    { length: totalBuckets },
    (_, bucketIdx) =>
      Array.from({ length: bucketSize }, (_, i) => bucketSize * bucketIdx + i),
  );
  // Remove 0 from first bucket
  buckets.at(0)!.shift();
  // Add 90 to last bucket
  buckets.at(-1)!.push(90);

  // Create tickets with column sets
  const tickets: Ticket[] = Array.from({ length: batchSize }, () =>
    Array.from({ length: totalBuckets }, () => []),
  );

  // Fill each column of each ticket with random item from corresponding bucket
  tickets.forEach((ticket) => {
    buckets.forEach((bucket, col) => {
      ticket[col].push(popRandom(bucket));
    });
  });

  const isTicketFull = (ticket: (typeof tickets)[0]) =>
    ticket.reduce((agg, col) => col.length + agg, 0) === fullTicketSize;

  let itemsLeft = bucketSize * totalBuckets - batchSize * totalBuckets;
  while (itemsLeft) {
    buckets.forEach((bucket, col) => {
      if (!bucket.length) return;

      let ticketIdx = randomInt(0, tickets.length);
      let ticket = tickets[ticketIdx];
      let pass = 1;

      while (ticket[col].length === 3 || isTicketFull(ticket)) {
        // Stuck
        if (!isTicketFull(ticket) && pass > 5) {
          // Find ticket having non-filled same column
          let exchangerIdx = (ticketIdx + 1) % tickets.length;
          while (tickets[exchangerIdx][col].length === 3)
            exchangerIdx = (exchangerIdx + 1) % tickets.length;

          // Since exchanger ticket could be filled, borrow from some other col of the ticket
          let exchangeCol = (col + 1) % totalBuckets;

          while (
            !(
              tickets[exchangerIdx][exchangeCol].length > 1 &&
              ticket[exchangeCol].length < 3 &&
              exchangeCol !== col
            )
          )
            exchangeCol = (exchangeCol + 1) % totalBuckets;

          // Add number to exchanger ticket
          itemsLeft--;
          tickets[exchangerIdx][col].push(popRandom(bucket));
          ticket[exchangeCol].push(
            popRandom(tickets[exchangerIdx][exchangeCol])!,
          );

          return;
        }

        pass++;
        ticketIdx = (ticketIdx + 1) % tickets.length;
        ticket = tickets[ticketIdx];
      }

      itemsLeft--;
      ticket[col].push(popRandom(bucket));
    });
  }

  const createEmptyTicket = (x: number, y: number): Ticket =>
    Array.from({ length: x }, () => Array(y).fill(0));

  // Distribute numbers
  return tickets.map((rawTicket) => {
    // Sort raw ticket col numbers
    rawTicket.forEach((col) => col.sort().reverse());

    const ticket = createEmptyTicket(3, 9);
    const rowFillCount = Array(3).fill(0);

    // Fill columns having 3 numbers
    rawTicket.forEach((nums, col) => {
      if (!(nums.length === 3)) return;
      ticket.forEach((row, i) => {
        row[col] = nums.pop()!;
        rowFillCount[i]++;
      });
    });

    // Fill column having 2 numbers
    rawTicket.forEach((nums, col) => {
      if (!(nums.length === 2)) return;

      let i = randomInt(0, 3);
      while (rowFillCount[i] === 5) i = (i + 1) % 3;

      let j = randomInt(0, 3);
      while (rowFillCount[j] === 5 || j === i) j = (j + 1) % 3;

      const num1 = nums.pop()!,
        num2 = nums.pop()!;

      if (i < j) {
        ticket[i][col] = num1;
        ticket[j][col] = num2;
      } else {
        ticket[j][col] = num1;
        ticket[i][col] = num2;
      }
      rowFillCount[i]++;
      rowFillCount[j]++;
    });

    // Fill columns having only 1 number
    rawTicket.forEach((nums, col) => {
      if (!(nums.length === 1)) return;
      let i = randomInt(0, 3);
      while (rowFillCount[i] === 5) i = (i + 1) % 3;
      ticket[i][col] = nums.pop()!;
      rowFillCount[i]++;
    });

    return ticket;
  });
}
