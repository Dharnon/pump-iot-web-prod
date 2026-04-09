# Pump IoT Web Platform

> 🇪🇸 **[Documentación en Español](./LEEME.md)** - Para despliegue y configuración completa en español

## Quick Links

- **[Deployment Guide (Spanish)](./DESPLIEGUE.md)** - Complete deployment instructions
- **[Quick Start](./LEEME.md)** - Get started in minutes
- **[Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md)** - Verification checklist

---

## What is this product?

**Pump IoT Web** is an industrial web application designed to manage, execute, and certify hydraulic pump performance tests at the **Flowserve test bench facility**.

### Objective

The platform digitises the entire pump testing workflow — from receiving a test order to issuing a certified performance report — eliminating paper-based processes and providing real-time visibility into each test as it happens.

### Who uses it?

| Role | Responsibility |
|------|---------------|
| **Supervisor** | Receives incoming pump test orders, schedules them across test banks, reviews protocols, and manages users and configuration. |
| **Operator** | Runs the physical test from a dedicated cockpit: controls the pump (motor speed, valve opening), monitors live telemetry, captures data points, and approves results. |

### Key features

- **Order inbox** – Supervisors receive and triage pump test orders (client, pump model, order ID).
- **Test scheduling** – Assign jobs to one of several test banks (Bank A, B, C…) and queue them in priority order.
- **Operator cockpit** – Real-time control panel to start/stop the motor, set speed and valve position, and watch live gauges (pressure, flow, temperature, power, NPSH).
- **Live telemetry** – Continuous data stream from the physical bench via SignalR, displayed as sparklines and numeric readouts.
- **Data capture** – Operators capture stabilised operating points that build the measured Q-H (flow vs. head) curve.
- **Analytics** – Automatic comparison of the measured curve against the theoretical design curve, with pass / fail determination per ISO/IEC test protocol.
- **PDF reports** – One-click generation of a signed test certificate that can be delivered to the client.
- **User management** – Supervisors create, edit, and deactivate operator accounts and assign each operator to a specific test bank.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Automated Setup (Recommended)

```bash
bash scripts/quick-start.sh
```

### Manual Setup

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
