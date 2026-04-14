# SCRUM Meeting 5 - Aura Boba

Prepared by: Garv
Meeting Date: Sunday, April 12, 2026
Time: 11:00 - 11:15 AM

## Meeting Attendees

1. Garv
2. Ibrahime
3. Rian
4. Christian
5. Andrew
6. Sam

## Meeting Agenda Items

- Checked in on everyones progress from yesterday
- Talked through some issues with the OAuth whitelist
- Made sure the chatbot and weather were actually connecting

## Status Update Since Last Meeting

Accomplishments:
- Cashier page is done, you can add drinks, toggle toppings, and submit orders
- Google OAuth is working, we have a whitelist for managers and cashiers
- ProtectedRoute is hooked up in the router
- Chatbot is working with the Groq API
- Weather widget is pulling temp from Open-Meteo for College Station

Tasks Completed:

| Task Description          | Assigned To | Completed? |
|---------------------------|-------------|------------|
| Cashier page              | Garv        | Yes        |
| Google OAuth route        | Andrew      | Yes        |
| ProtectedRoute component  | Andrew      | Yes        |
| Chatbot backend + widget  | Sam         | Yes        |
| Weather API + component   | Christian   | Yes        |

## Before The Next Meeting

Plans:
- Ibrahime: finish manager dashboard with the chart, employee list, and add item form
- Rian: finish kitchen page with polling and the mark as ready button
- Christian: finish menu board with category tabs
- Andrew: add employee GET and POST endpoints
- Garv: finish manager stats with the usage table and date picker
- Sam: make sure chatbot points to Render URL not localhost

Task Assignments:

| Task Description              | Assigned To |
|-------------------------------|-------------|
| Manager dashboard             | Ibrahime    |
| Employee endpoints            | Andrew      |
| Kitchen page                  | Rian        |
| Menu board                    | Christian   |
| Manager stats component       | Garv        |
| Fix chatbot URL for prod      | Sam         |

## Minutes from Previous Meeting

Meeting 4 was Saturday. We split everything up and everyone knew what they were doing. Main thing we flagged today was that the chatbot was still hitting localhost so it would break on the deployed site. Sam is fixing that. Everything else is mostly done or close.
