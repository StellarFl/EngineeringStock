# ForgeTrack Standard Operating Procedures

## 1. Purpose

This document defines the standard procedures for operating, developing, deploying, and supporting ForgeTrack. ForgeTrack is an engineering operations platform for inventory, products, orders, projects, equipment, users, and field reports.

## 2. System Overview

ForgeTrack consists of:

- A Next.js frontend in `frontend/`
- A TypeScript and Express REST API in `backend/`
- A PostgreSQL database managed through Prisma
- SMTP email delivery for password resets and low-stock alerts
- Cloudinary image storage for field-report photos
- Vercel for the frontend deployment
- Render for the backend deployment

The frontend communicates with the backend through authenticated API requests using JWTs.

## 3. User Access and Security

### 3.1 Sign in

1. Open the ForgeTrack application in a supported browser.
2. Enter the registered email address and password.
3. Complete Google sign-in when using the OAuth option.
4. Confirm that the dashboard loads and the expected organization and role are displayed.

### 3.2 Password reset

1. Select the password reset option on the login page.
2. Enter the account email address.
3. Open the reset link received by email.
4. Set a new password and sign in again.
5. Do not share reset links or passwords with other users.

### 3.3 User invitations and roles

1. An administrator opens the user administration area.
2. Selects the option to invite a user.
3. Enters the user email address and assigns the appropriate role.
4. Sends the invitation.
5. The recipient accepts the invitation and completes account setup.
6. Administrators review user status and remove or update access when responsibilities change.

Use the least-privileged role required for each user. Never share accounts.

## 4. Inventory and Product Procedures

### 4.1 Add a product or inventory item

1. Open Products or Inventory.
2. Select Add Product or Add Inventory Item.
3. Enter the name, specification, category, SKU, quantity, reorder point, supplier details, and location when applicable.
4. Review the values carefully, especially SKU and quantity.
5. Save the item.
6. Confirm that it appears in search and that the dashboard totals are updated.

### 4.2 Update stock

1. Locate the product or inventory item.
2. Confirm the reason for the stock change.
3. Apply the quantity update or record the relevant movement.
4. Verify the resulting quantity.
5. Add a note when the change is caused by damage, a stocktake, a return, or another exception.

When stock reaches or falls below the configured threshold, confirm that the low-stock notification process has the required supplier email address.

### 4.3 Stocktake

1. Export or open the current inventory list.
2. Count physical stock by location.
3. Compare physical quantities with ForgeTrack quantities.
4. Record approved adjustments with a clear reason.
5. Escalate unexplained differences to the operations manager.
6. Review low-stock items after the stocktake is complete.

## 5. Orders and Equipment Checkouts

### 5.1 Create an order

1. Open Orders and select Create Order.
2. Select the customer and required products.
3. Confirm quantities and prices.
4. Submit the order.
5. Confirm that available stock was reduced correctly.
6. Track the order status as pending, fulfilled, or cancelled.

Do not create duplicate orders. If an order is entered incorrectly, follow the correction process and document the reason for the change.

### 5.2 Check out equipment

1. Open Engineering and select the checkout workflow.
2. Select the borrower and project when applicable.
3. Add each inventory item and quantity.
4. Enter the expected return date and any notes.
5. Confirm the checkout.
6. Review open and overdue checkouts regularly.

When equipment is returned, update the checkout promptly and verify the physical item condition.

## 6. Projects and Sites

### 6.1 Create a project

1. Open Engineering Projects.
2. Enter the project name, code, customer, status, dates, and site.
3. Save the project.
4. Allocate required inventory only after confirming availability.
5. Keep the project status current throughout its lifecycle.

### 6.2 Manage sites

1. Use a consistent site name and code.
2. Avoid creating duplicate sites with spelling variations.
3. Confirm the site before associating projects, inventory, or field visits.
4. Update site details when the operational location changes.

## 7. Field Reports and Images

### 7.1 Upload field-report images

1. Open the Field Reports or Field Gallery area.
2. Select one or more site images.
3. Choose the issue category.
4. Enter the site or location.
5. Add an optional note describing the evidence or issue.
6. Upload the images.
7. Confirm that each image appears in the gallery.
8. Check the `Added by` badge to confirm the account responsible for the upload.

Use clear filenames and upload the highest-quality image that remains within the configured file-size limit. Do not upload confidential material that is not required for the field report.

### 7.2 Review field images

1. Filter images by issue category or location.
2. Confirm that the image belongs to the correct site.
3. Review the uploader badge, date, and notes.
4. Report incorrect attribution, duplicate images, or missing images to an administrator.

## 8. Local Development

### 8.1 Required tools

- Node.js
- pnpm
- PostgreSQL
- Git

### 8.2 Start the backend

```bash
cd backend
pnpm install
pnpm prisma generate
pnpm dev
```

The local API normally runs at `http://localhost:3000/api`.

### 8.3 Start the frontend

In a second terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Create `frontend/.env.local` with:

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

The local frontend normally runs at `http://localhost:3000`, unless Next.js selects another port.

### 8.4 Validate changes

Run the frontend checks before opening a pull request:

```bash
cd frontend
pnpm exec tsc --noEmit --pretty false
pnpm exec eslint .
```

For backend changes, also run the backend build or typecheck command configured by the project before deployment.

## 9. Environment Configuration

Use `backend/.env.example` as the reference for required backend variables. Configure secrets only in local environment files or the deployment provider. Never commit real credentials.

Required areas include:

- `DATABASE_URL` for PostgreSQL
- `JWT_SECRET` for authentication tokens
- SMTP settings for email
- `CLIENT_URL` for the deployed frontend origin
- Google OAuth credentials when OAuth is enabled
- Cloudinary credentials for field-report images

Use long, unique production secrets. Rotate credentials immediately if they are exposed.

## 10. Deployment Procedure

### 10.1 Before deployment

1. Confirm the intended branch and commit.
2. Review changed files and environment requirements.
3. Run frontend typecheck and lint.
4. Run the backend validation/build command.
5. Confirm database migrations are ready.
6. Confirm deployment environment variables are present.
7. Confirm frontend and backend URLs and CORS settings match.

### 10.2 Deploy

1. Push the approved commit to the deployment branch.
2. Monitor the Vercel frontend build.
3. Monitor the Render backend deployment.
4. Confirm the backend health endpoint responds successfully.
5. Open the frontend and test login.
6. Test one read operation and one write operation.
7. Review deployment logs for errors.

### 10.3 Post-deployment smoke test

- Login works.
- Dashboard data loads.
- Products or inventory can be viewed.
- An authorized user can create or update a record.
- Field-report images load and show the uploader badge.
- Password reset or email delivery works when relevant.
- Unauthorized users cannot access protected dashboard routes.

## 11. Troubleshooting

### Frontend cannot reach the API

1. Check `NEXT_PUBLIC_API_BASE_URL`.
2. Confirm the backend is running.
3. Confirm the backend `CLIENT_URL` allows the frontend origin.
4. Check the browser network tab and backend logs.

### Login fails

1. Confirm the account exists and is active.
2. Confirm the backend database connection.
3. Confirm `JWT_SECRET` is configured consistently for the running backend.
4. Check API and authentication logs without exposing tokens or passwords.

### Images do not upload

1. Confirm the file is an accepted image type and within the size limit.
2. Confirm Cloudinary variables are configured.
3. Check backend logs for upload errors.
4. Confirm the image appears in Cloudinary and the database record was created.

### Low-stock email was not sent

1. Confirm the product has a supplier email address.
2. Confirm SMTP settings and credentials.
3. Check whether the stock actually crossed the threshold.
4. Review backend email logs.
5. Do not repeatedly edit stock only to trigger alerts; document and correct the underlying data instead.

## 12. Incident and Data Handling Rules

- Do not expose passwords, JWTs, API keys, database URLs, or SMTP credentials in tickets, screenshots, or chat.
- Preserve the original error message, timestamp, user role, and affected workflow when reporting an incident.
- Do not delete production records to correct a mistake without approval.
- Back up or verify recoverability of production data before schema or migration changes.
- Escalate suspected unauthorized access immediately.

## 13. Change Management

Every production change should include:

1. A clear description of the change.
2. The affected frontend, backend, database, or configuration areas.
3. Validation results.
4. Any required environment-variable or migration updates.
5. A rollback or recovery note for high-risk changes.

Keep this SOP updated whenever a major workflow, deployment target, role model, or integration changes.
