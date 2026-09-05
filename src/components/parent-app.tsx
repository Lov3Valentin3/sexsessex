{tab === "Prices" ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="panel gold-border p-5 md:col-span-2">
            <h2 className="font-display text-2xl text-np-gold">Family prices</h2>
            <p className="text-sm text-np-cream/70">
              These plans are only visible to grown-ups. Kids never see checkout.
            </p>
          </article>
          {PLANS.map((plan) => (
            <article key={plan.code} className={`panel gold-border p-5 ${planCode === plan.code ? "ring-2 ring-np-green" : ""}`}>
              <h3 className="font-display text-xl text-np-gold">{plan.name}</h3>
              <p className="text-2xl font-extrabold">
                {formatPrice(plan.priceCents)} <span className="text-sm">{periodLabel(plan.period)}</span>
              </p>
              <ul className="mt-2 text-sm text-np-cream/75">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <button className="magic-btn mt-4 w-full" onClick={() => setPlanCode(plan.code)}>
                Select
              </button>
            </article>
          ))}