You are an expert Full Stack Developer building a Logistics CRM. We have a `.cursorrules` file defining our strict business logic. We will build this iteratively.

## Step 1: Initialization & Infrastructure
1.  Initialize a new Next.js 14 (App Router) project with TypeScript and Tailwind CSS.
2.  Install Shadcn/UI and add core components: Button, Input, Card, Table, Dialog, Select, Badge, DatePicker, Form, Toast, Sheet (for sidebars).
3.  Set up Supabase client in `lib/supabase.ts`.
4.  Create a Layout wrapper with a modern Sidebar navigation (Dashboard, Positions, Suppliers, Customers, Finance, Settings).
5.  *Design Note:* Use a color palette suitable for logistics (Deep Blues, Clean Greys, and Traffic Light colors for status: Green/Red/Orange).

## Step 2: Master Data Modules (Customers & Suppliers)
1.  Create pages for `Customers` and `Suppliers`.
2.  **Crucial Feature:** Implement the "Supplier Reference System". When adding a supplier, ensure there is logic to generate specific Reference Numbers for future invoicing.
3.  Implement "Payment Terms" (Vade) fields for suppliers.

## Step 3: The "Position" (Operasyon Kartı) Core - UI
1.  Create the "Create Position" form. It must support:
    -   Route (Loading -> Unloading).
    -   Intermediate Stops (Dynamic list).
    -   Cargo details.
2.  Create the "Position Detail" view. This is the heart of the app (Maximo style).
    -   Header: Status Badge, Profitability Summary, Map/Route visualization.
    -   Tabs: Overview, Documents, Financials, Events/Logs.

## Step 4: The "Document Lock" & Logic Implementation
1.  Implement the State Machine for Position Status: `DRAFT` -> `READY` -> `IN_TRANSIT` -> `DELIVERED` -> `CLOSED`.
2.  **Strict Rule:** Implement the barrier logic.
    -   Create a utility function `canDepart(positionId)` checking for mandatory docs (License, Insurance, Contract).
    -   Create a utility function `canClose(positionId)` checking for Invoices and CMR.
    -   Visually represent this on the UI: A "Missing Actions" widget that blinks or shows Red items until they are Green.

## Step 5: Finance & Profitability
1.  Create the Financial tab in Position Detail.
2.  Allow entry of Sales Price (Navlun) and Cost (Tedarikçi Ödemesi).
3.  Support Multi-currency selection (USD, EUR, RUB, TRY).
4.  Display automatic profit calculation: `(Sales - Cost - Extras)`.
5.  Show the "Supplier Reference Number" prominently here for the user to communicate to the trucker.

## Step 6: Dashboard & ERP Features
1.  Build the Main Dashboard.
    -   "Action Required": List of positions waiting for documents (The Alert System).
    -   Total Profitability Widget (Monthly).
    -   Active Trucks Map (Mockup or real integration).
2.  Implement PDF generation for "Freight Proposal" (Navlun Teklifi) in the Customer module.

## Step 7: Refinement
1.  Check strictly against `.cursorrules`. Ensure no "Closed" position exists without a CMR in the database.
2.  Polish the UI: Add smooth transitions, loading states, and ensure mobile responsiveness.