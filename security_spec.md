# SmartStay Security Specification

## Data Invariants
- A booking must reference a valid property and the property's owner.
- A user can only see/edit their own profile (except admins).
- Only owners can manage their properties.
- Only vendors can manage their food plans, appliances, and services.
- Chat messages can only be sent/read by participants of the room.
- Roles are immutable by the user after creation (only admin can change if needed, but for now we restrict self-assignment based on a lookup).

## The Dirty Dozen (Test Matrix)
1. User A tries to update User B's profile.
2. User A tries to delete a Property owned by Owner B.
3. User A tries to approve a Booking for themselves.
4. User A tries to read a ChatRoom they are not a participant of.
5. User A tries to send a Message to a Room they are not in.
6. User A tries to set their role to 'admin' during signup.
7. User A tries to update a Booking's status from 'approved' to 'pending' (illegal state transition).
8. User A tries to list all Properties (Read is public, so this should pass if signed in).
9. User A tries to read all User profiles (Should be denied unless owner or admin).
10. Anonymous user tries to create a Booking.
11. User A tries to inject a huge string into a message text.
12. User A tries to create a Property without being an 'owner' or 'admin'.

## Role Enforcement
Roles will be checked against the `/users/{uid}` document.
