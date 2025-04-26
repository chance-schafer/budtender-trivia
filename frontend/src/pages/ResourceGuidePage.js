import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    TextField,
    Box,
    List,
    ListItem,
    ListItemText,
    Paper,
    Link as MuiLink,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug'; // Import rehype-slug
// Removed useTheme as we'll use Tailwind classes directly

// --- Paste the Markdown Content Here ---
const markdownContent = `
# Budtender Knowledge Manual

This manual provides comprehensive knowledge covering the essential aspects of cannabis science, products, practices, and regulations, designed to equip budtenders with expert-level understanding.

## Cannabis Science Fundamentals {#cannabis-science-fundamentals}

### Cannabinoids - Major {#cannabinoids-major}

*   **THC (Δ9-Tetrahydrocannabinol):**
    *   **Role:** The primary psychoactive compound in cannabis.
    *   **Mechanism:** Acts as a partial agonist at CB1 receptors, which are densely located in the central nervous system. This interaction is mainly responsible for the intoxicating effects ("high").
*   **CBD (Cannabidiol):**
    *   **Role:** A major non-psychoactive cannabinoid.
    *   **Mechanism:** Does not bind strongly or directly to CB1 or CB2 receptors as an agonist. Instead, it exerts its effects through complex interactions, such as modulating other receptors (e.g., serotonin, TRPV1) and influencing the endocannabinoid system indirectly (e.g., inhibiting FAAH, the enzyme that breaks down anandamide).

### Cannabinoids - Minor {#cannabinoids-minor}

*   **CBG (Cannabigerol):**
    *   **Role:** Often called the "mother" or "stem cell" cannabinoid. CBGA (its acidic form) is the precursor molecule from which enzymes synthesize THCA, CBDA, and CBCA.
    *   **Mechanism:** Shows some direct affinity for CB1/CB2 receptors (acting potentially as a partial agonist or antagonist depending on context) and also interacts with other receptors like 5-HT1A. Research is ongoing.
*   **CBN (Cannabinol):**
    *   **Formation:** Primarily forms through the degradation (oxidation) of THC over time, especially with exposure to air and light. It's not synthesized in large amounts directly by the plant.
    *   **Associated Effect:** Commonly linked, though not definitively proven in robust human trials, with sedative or sleep-aid properties. Often found in higher concentrations in aged cannabis.
*   **THCV (Tetrahydrocannabivarin):**
    *   **Structure & Effect:** Structurally similar to THC but notable for potential contrasting effects. Research suggests THCV may act as an appetite suppressant and could have benefits for glucose metabolism, unlike THC's typical appetite stimulation. Its psychoactivity depends on the dose (low doses might be non-psychoactive or even counteract THC, higher doses can be psychoactive).
*   **CBC (Cannabichromene):**
    *   **Mechanism:** Interacts weakly with CB1/CB2 receptors but strongly with TRP channels (TRPV1 and TRPA1) involved in pain and inflammation perception. May also boost levels of the body's own endocannabinoids (like anandamide) by inhibiting their breakdown.
*   **CBDV (Cannabidivarin):**
    *   **Structure & Potential Use:** A non-intoxicating homolog of CBD (similar structure but shorter side chain). Shows promise in preclinical research for managing epilepsy and seizure disorders due to its potential anticonvulsant properties.

### Cannabinoid Acids {#cannabinoid-acids}

*   **Definition:** These are the precursors to the well-known cannabinoids, found in raw cannabis plants. They have an extra carboxyl group (COOH). Examples include THCA, CBDA, and CBGA.
*   **Key Characteristic:** Cannabinoid acids are generally non-psychoactive in their natural state (e.g., THCA does not produce the "high" associated with THC).
*   **Activation (Decarboxylation):** The process of removing the carboxyl group, typically through heat (smoking, vaping, baking) or sometimes prolonged curing/time, converts the acid form into the active, neutral form (e.g., THCA → THC, CBDA → CBD). This "activates" the psychoactive or primary therapeutic properties associated with the neutral forms.

### Cannabinoid Biosynthesis {#cannabinoid-biosynthesis}

*   **Starting Point:** Synthesis begins in the plant with Geranyl Pyrophosphate (GPP) and Olivetolic Acid (OA) (or Divarinic Acid for 'varin' cannabinoids like THCV, CBDV).
*   **Central Precursor:** These initial molecules combine to form Cannabigerolic Acid (CBGA), the "mother cannabinoid" acid.
*   **Branching Out:** Specific enzymes (synthases) then convert CBGA into the main acidic cannabinoids:
    *   THCA Synthase → THCA
    *   CBDA Synthase → CBDA
    *   CBCA Synthase → CBCA

### Endocannabinoid System (ECS) {#endocannabinoid-system}

*   **Core Components:** The ECS is a vital signaling system in the body composed of:
    1.  **Endocannabinoids:** Neurotransmitters produced by the body (e.g., Anandamide, 2-AG).
    2.  **Cannabinoid Receptors:** Primarily CB1 and CB2 receptors, located on cell surfaces throughout the body.
    3.  **Metabolic Enzymes:** Enzymes that create and break down endocannabinoids (e.g., FAAH breaks down Anandamide, MAGL breaks down 2-AG).
*   **Receptor Locations:**
    *   **CB1 Receptors:** Found most densely in the brain and central nervous system. They are the main target for THC's psychoactive effects.
    *   **CB2 Receptors:** Found mainly in the peripheral nervous system and on immune cells. They play key roles in regulating inflammation and immune response.
*   **Enzyme Function:** Metabolic enzymes ensure endocannabinoids act only when and where needed by synthesizing them on demand and quickly degrading them after use.

### Terpenes - Definition & Role {#terpenes-definition-role}

*   **What they are:** Aromatic volatile organic compounds produced in the cannabis plant's trichomes (resin glands).
*   **Primary Role:** Responsible for the distinct scents and flavors of different cannabis cultivars (e.g., citrus, pine, floral, earthy, pungent).
*   **Potential Secondary Role (Entourage Effect):** Terpenes are theorized to interact synergistically with cannabinoids (like THC and CBD) to modulate or enhance their overall effects.

### Terpenes - Major Profiles {#terpenes-major-profiles}

*   **Myrcene:**
    *   **Aroma:** Earthy, musky, clove-like, sometimes slightly fruity.
    *   **Associated Effects:** Often linked to relaxation, sedation ("couch-lock" in high amounts), and potentially enhancing THC's effects. Commonly found in strains described as "Indica."
*   **Limonene:**
    *   **Aroma:** Strong citrus (lemon, orange).
    *   **Associated Effects:** Frequently associated with mood elevation, stress relief, energizing feelings, and potential anti-anxiety properties. Common in "Sativa" or hybrid profiles.
*   **Pinene (Alpha & Beta):**
    *   **Aroma:** Distinct pine needles.
    *   **Associated Effects:** Linked to alertness, memory retention, focus, and potentially counteracting some THC-induced cognitive fog. May also act as a bronchodilator.
*   **Beta-Caryophyllene:**
    *   **Aroma:** Spicy, peppery, woody, clove-like.
    *   **Unique Feature:** The only known terpene to also act as a cannabinoid by binding directly to CB2 receptors.
    *   **Associated Effects:** Linked to anti-inflammatory and analgesic (pain relief) potential.
*   **Linalool:**
    *   **Aroma:** Floral, lavender, hints of spice.
    *   **Associated Effects:** Widely associated with calming, relaxing, anti-anxiety, and potentially sedative properties.
*   **Terpinolene:**
    *   **Aroma:** Complex mix: floral, piney, herbaceous, sometimes slightly fruity/citrusy.
    *   **Associated Effects:** Often found in uplifting, cerebral, "Sativa"-leaning strains (like Jack Herer). Less common as the single dominant terpene.
*   **Humulene:**
    *   **Aroma:** Earthy, woody, spicy/herbal (similar to hops).
    *   **Associated Effects:** Investigated for anti-inflammatory properties and potentially appetite suppression (similar to THCV).

### Terpenes - Boiling Points {#terpenes-boiling-points}

*   **Relevance:** Terpenes vaporize at different temperatures. Understanding this is key for vaporization.
*   **Low vs. High Temp Vaping:**
    *   Lower temperatures (e.g., ~310-350°F / 155-177°C) tend to preserve the more volatile terpenes with lower boiling points (like Pinene, Caryophyllene, Humulene), emphasizing flavor.
    *   Higher temperatures (e.g., ~370-430°F / 188-221°C) release less volatile terpenes (like Myrcene, Limonene, Linalool) and ensure full cannabinoid vaporization but can degrade delicate flavor notes.
*   **Examples:** Humulene (~107°C/225°F) is very volatile, while Linalool (~199°C/390°F) is much less volatile.

### Entourage/Ensemble Effect {#entourage-ensemble-effect}

*   **Concept:** The theory that various cannabis compounds (cannabinoids, terpenes, flavonoids) work together synergistically, producing effects that are different or greater than the sum of their individual parts.
*   **Scientific Status:** A plausible theory supported by preclinical data and anecdotal evidence, but robust, conclusive human clinical trials proving specific synergistic interactions (especially terpenes significantly altering THC's core effects consistently) are still limited. It remains an active research area.

### Advanced Science - Flavonoids & Other Compounds {#advanced-science}

*   **Flavonoids:**
    *   **Role:** Compounds contributing to plant pigmentation (color), but also possessing antioxidant, anti-inflammatory, and neuroprotective properties.
    *   **Cannabis-Specific:** Cannflavins A, B, and C are largely unique to cannabis and show potent anti-inflammatory effects in research (potentially inhibiting pathways like PGE2).
    *   **Other Examples:** Apigenin (also in chamomile, potential anxiolytic effects), Quercetin (antioxidant).
*   **Volatile Sulfur Compounds (VSCs):**
    *   **Role:** Recently identified class of compounds responsible for the characteristic pungent, "skunky" aroma of some cannabis cultivars, previously attributed only to terpenes. Similar to compounds found in garlic.

## Plant Anatomy {#plant-anatomy}

### Trichomes {#trichomes}

*   **Definition:** Microscopic, hair-like outgrowths on the plant surface, especially concentrated on the flowers and sugar leaves. They appear as tiny resin glands.
*   **Function:** The primary sites of cannabinoid (THC, CBD, etc.) and terpene synthesis and storage.
*   **Types (Glandular):**
    *   **Bulbous:** Smallest, no stalk.
    *   **Capitate-Sessile:** Larger head, sits directly on the plant surface (no stalk).
    *   **Capitate-Stalked:** Largest head, sits atop a visible stalk. These are the main producers of cannabinoids and terpenes and are most abundant on flowers.

### Flower Structure (Female) {#flower-structure}

*   **Bud:** The entire flower cluster.
*   **Bract:** Small, leaf-like structures that enclose the female reproductive parts. They form the main substance of the bud and are typically covered in trichomes. (Often confused with Calyx).
*   **Calyx:** The base of the flower, a small pod-like structure enclosing the ovule. Usually very resinous.
*   **Pistil:** The reproductive organ, containing:
    *   **Stigmas:** The hair-like strands (often white, orange, red, or brown) that emerge from the bracts, designed to capture airborne pollen.

### Leaves {#leaves}

*   **Fan Leaves:** Large, broad leaves with the iconic cannabis shape. Primary function is photosynthesis (capturing light energy). They contain very low levels of cannabinoids/terpenes.
*   **Sugar Leaves:** Smaller leaves found growing within or protruding from the flower buds. They are often coated in trichomes, giving them a "sugary" appearance, and contain higher levels of cannabinoids/terpenes than fan leaves (but less than the bracts/calyxes). Often trimmed off but can be used for extracts or edibles.

## Classification {#classification}

### Indica/Sativa/Hybrid Paradigm {#indica-sativa-hybrid}

*   **Traditional View (Often Unreliable):**
    *   **Indica:** Associated with short, bushy plants, broad leaves; believed to cause relaxing, body-focused, sedative effects ("in-da-couch").
    *   **Sativa:** Associated with tall, lanky plants, narrow leaves; believed to cause energizing, cerebral, uplifting effects.
    *   **Hybrid:** Crosses exhibiting a mix of traits.
*   **Modern Scientific View:** These physical traits (morphology) no longer reliably predict the chemical profile (cannabinoids/terpenes) or the resulting effects due to extensive cross-breeding. Effects are determined by the specific *chemovar*.

### Chemotypes/Chemovars {#chemotypes-chemovars}

*   **Chemotype (Chemical Phenotype):** Classifies cannabis based on the ratio of its dominant cannabinoids:
    *   **Type I:** THC-dominant (high THC, low CBD).
    *   **Type II:** Mixed or Balanced (significant amounts of both THC and CBD, e.g., 1:1 ratio).
    *   **Type III:** CBD-dominant (high CBD, low THC - includes legal hemp).
    *   **Type IV:** Rare variants where a minor cannabinoid like CBG is dominant.
*   **Chemovar (Chemical Variety):** A more precise classification that considers the full chemical profile, including the specific suite and concentration of major *and* minor cannabinoids *and* the dominant terpenes. This provides the best available basis for anticipating potential effects and aroma/flavor.

### Popular Strain Profiles (Examples & Associated Terpenes/Effects) {#popular-strain-profiles}

*   **Note:** Effects are subjective and influenced by individual physiology, tolerance, dose, and set/setting. These are common associations.
*   **Blue Dream (Hybrid - Sativa Dom; Blueberry x Haze):**
    *   **Profile:** Often Myrcene, Pinene, Caryophyllene. Sweet berry aroma.
    *   **Associated Effects:** Balanced, cerebral uplift combined with gentle full-body relaxation. Good for daytime use, stress relief without heavy sedation.
*   **Sour Diesel (Sativa Dom; Chemdawg lineage):**
    *   **Profile:** Often Caryophyllene, Limonene, Myrcene. Pungent, fuel/diesel aroma.
    *   **Associated Effects:** Fast-acting, energizing, dreamy, cerebral effects. Good for daytime, boosting energy, creativity.
*   **OG Kush (Hybrid - Indica Dom; Chemdawg x Hindu Kush lineage?):**
    *   **Profile:** Often Myrcene, Limonene, Caryophyllene. Complex earthy, pine, fuel, citrus funk aroma.
    *   **Associated Effects:** Heavy euphoria, stress relief, relaxation often leading to couch-lock. Strong effects.
*   **Granddaddy Purple (GDP) (Indica Dom; Purple Urkle x Big Bud):**
    *   **Profile:** Often Myrcene dominant. Grape and berry aroma. Visually distinct purple hues.
    *   **Associated Effects:** Potent relaxation, euphoria, often leading to sedation/sleepiness. Good for evening use, stress, pain.
*   **GSC / Girl Scout Cookies (Hybrid; OG Kush x Durban Poison):**
    *   **Profile:** Often Caryophyllene, Limonene, Humulene. Sweet, earthy, pungent aroma.
    *   **Associated Effects:** Strong, potent euphoria and full-body relaxation. Can be intense.
*   **Jack Herer (Sativa Dom; Haze x (NL#5 x Shiva Skunk)):**
    *   **Profile:** Often Terpinolene dominant, with Pinene, Caryophyllene. Spicy, pine, citrus aroma.
    *   **Associated Effects:** Blissful, clear-headed, creative uplift. Good for focus, daytime activities.
*   **Northern Lights (Indica Dom; Afghani x Thai):**
    *   **Profile:** Often Myrcene dominant. Sweet, spicy aroma.
    *   **Associated Effects:** Classic indica effects: deep relaxation, euphoria, muscle ease, often leading to sleepiness.
*   **Durban Poison (Sativa; South African Landrace):**
    *   **Profile:** Often Terpinolene dominant. Sweet, earthy, piney aroma.
    *   **Associated Effects:** Highly energetic, clear-headed, focusing effects. Excellent for daytime productivity.

## Basic Cultivation Concepts {#basic-cultivation-concepts}

### Growing Environments {#growing-environments}

*   **Indoor:** Offers maximum control over light, temperature, humidity, CO2, pests. Often results in highest consistency and potency but is resource-intensive.
*   **Greenhouse:** Combines natural sunlight with some environmental control (temperature, humidity, supplemental lighting). A balance between indoor control and outdoor resources.
*   **Outdoor:** Relies on natural sunlight and environment. Lower cost and resource use, but subject to weather, pests, and seasonal limitations. Quality and consistency can vary more.

### Growing Mediums {#growing-mediums}

*   **Soil:** Traditional medium, provides natural nutrients and microbial life. Requires proper pH balancing and nutrient management.
*   **Soilless Mixes (e.g., Coco Coir, Peat Moss, Perlite):** Offer good drainage and aeration. Require precise nutrient delivery via water (hydroponic principles). Popular examples:
    *   **Coco Coir:** Made from coconut husks, excellent water retention and aeration. Needs calcium/magnesium buffering.
    *   **Rockwool:** Inert, spun mineral fiber. Provides good support but needs careful pH management and is less environmentally friendly to dispose of.
*   **Hydroponics:** Growing plants with roots suspended in nutrient-rich water solutions (e.g., Deep Water Culture - DWC) or periodically flooded inert media (e.g., clay pebbles). Allows precise nutrient control and potentially faster growth.
*   **Aeroponics:** Roots suspended in air and misted with nutrient solution. Highly efficient but complex to manage.

### Lighting {#lighting}

*   **Photoperiod:** Cannabis flowering is typically triggered by the length of the dark period.
    *   **Vegetative Stage:** Long light periods (e.g., 18 hours light / 6 hours dark or 24/0) keep plants growing leaves and stems.
    *   **Flowering Stage:** Triggered by providing a long, uninterrupted dark period (typically 12 hours dark / 12 hours light).
*   **Light Spectrum:**
    *   **Blue Spectrum:** More important during vegetative growth for sturdy stems and leaf development.
    *   **Red/Orange Spectrum:** More important during flowering to promote bud formation and density.
    *   **Full Spectrum (like sunlight or quality LEDs/CMH):** Provides all necessary wavelengths for optimal growth throughout the plant's life cycle.
*   **Light Types:** High-Intensity Discharge (HID - MH for veg, HPS for flower), Light Emitting Diodes (LEDs - increasingly popular, efficient, tunable spectrum), Ceramic Metal Halide (CMH).

### Nutrients {#nutrients}

*   **Macronutrients:** Needed in larger amounts: Nitrogen (N), Phosphorus (P), Potassium (K). Plant needs vary by growth stage (more N in veg, more P & K in flower).
*   **Secondary Macronutrients:** Calcium (Ca), Magnesium (Mg), Sulfur (S).
*   **Micronutrients:** Needed in trace amounts: Iron (Fe), Manganese (Mn), Zinc (Zn), Copper (Cu), Boron (B), Molybdenum (Mo).
*   **pH:** Crucial for nutrient uptake. Cannabis in soil prefers slightly acidic pH (approx. 6.0-7.0), hydroponics slightly lower (approx. 5.5-6.5). Incorrect pH locks out nutrients.

### Harvesting, Drying & Curing {#harvesting-drying-curing}

*   **Harvest Timing:** Determined by trichome maturity (visual inspection with magnification). Peak THC is often associated with mostly cloudy/milky trichomes with a small percentage turning amber. Clear = immature; mostly amber = potentially degrading THC into CBN (more sedative effect).
*   **Drying:** Slow removal of excess moisture from harvested buds. Typically done in a cool, dark, controlled-humidity environment (e.g., 60°F / 60% RH) for 7-14 days. Buds should feel dry outside but retain some moisture inside; small stems should snap, not bend.
*   **Curing:** The crucial final step. Dried buds are placed in airtight containers (usually glass jars), opened periodically ("burping") to release moisture and gases.
    *   **Purpose:** Breaks down chlorophyll (improves smoothness), develops optimal flavor and aroma (terpene maturation), preserves cannabinoids, increases shelf life, prevents mold.
    *   **Duration:** Minimum 2-4 weeks, often longer for connoisseur quality.

### Common Quality Issues {#common-quality-issues}

*   **Mold/Mildew:** Fuzzy white, grey, or black spots; powdery white coating; musty, mildewy, or ammonia-like smell. **Unsafe to consume.** Caused by excessive humidity during growth or improper drying/curing.
*   **Harshness/Chemical Taste:** Often due to insufficient flushing of nutrients before harvest or improper drying/curing leaving chlorophyll/salts. May spark when lit.
*   **Overly Dry/Crumbly:** Degrades cannabinoids and terpenes, harsh smoke. Caused by drying too quickly or poor storage.
*   **Too Wet:** Risk of mold, difficult to smoke/vape. Caused by incomplete drying.
*   **Pests:** Visible insects (spider mites, fungus gnats, aphids), webbing, or larval damage.

### Integrated Pest Management (IPM) {#integrated-pest-management}

*   **Goal:** Manage pests and diseases effectively with minimal risk to people and the environment.
*   **Principles:** Emphasis on prevention (cleanliness, environmental controls, resistant strains), regular monitoring, and using the least toxic methods first.
*   **Methods:** Biological controls (beneficial insects like ladybugs, predatory mites), physical controls (sticky traps, barriers), cultural controls (pruning, proper spacing), natural/organic pesticides (neem oil, insecticidal soaps - used cautiously and stopped well before harvest), and synthetic pesticides only as a last resort where legally permitted and necessary.

### Advanced Cultivation Techniques {#advanced-cultivation-techniques}

*   **Training Methods:** Techniques to manipulate plant shape for better light exposure and yield.
    *   **Topping/Fimming:** Cutting the main stem tip to encourage bushier growth with multiple main colas.
    *   **Low-Stress Training (LST):** Gently bending and tying down branches to create an even canopy without cutting.
    *   **SCROG (Screen of Green):** Using a horizontal screen/net to train branches through, creating a flat, wide canopy ideal for maximizing yield under grow lights.
    *   **SOG (Sea of Green):** Growing many small plants close together and flowering them early to quickly fill the space with a dense canopy of single colas. Faster turnaround time.
    *   **Lollipopping:** Removing lower branches and bud sites that receive little light, focusing the plant's energy on the top canopy colas.
    *   **Super Cropping:** Carefully pinching/bending stems (without breaking the outer layer) to stress the plant, potentially increasing resin production and redirecting growth.

## Extraction Methods {#extraction-methods}

### Core Distinction {#extraction-distinction}

*   **Solvent-Based:** Use a chemical solvent (e.g., butane, propane, ethanol, CO2) to dissolve cannabinoids and terpenes from the plant material. The solvent is then removed (purged) from the final extract.
*   **Solventless:** Use mechanical or physical methods (e.g., ice water agitation, heat, pressure, sieving) to separate the trichome heads (resin glands) from the plant material without chemical solvents.

### CO2 Extraction {#co2-extraction}

*   **Process:** Uses carbon dioxide (CO2) under specific temperature and pressure to reach a "supercritical" state (properties of both liquid and gas), acting as a solvent.
*   **Advantages:** CO2 is non-toxic, non-flammable, leaves no residual solvent if purged correctly ("clean"). Allows for "tunable" extraction by adjusting pressure/temp to target specific compounds (e.g., terpenes vs. cannabinoids).
*   **Disadvantages:** High equipment cost, high energy consumption. Can sometimes strip volatile terpenes if not carefully controlled. Typically requires dry starting material.
*   **Common Products:** Distillate base oil, vape cartridge oil, refined oils for edibles/tinctures.

### Hydrocarbon Extraction (BHO/PHO) {#hydrocarbon-extraction}

*   **Process:** Uses light hydrocarbons like butane (BHO = Butane Hash Oil) or propane (PHO = Propane Hash Oil) as solvents.
*   **Advantages:** Excellent at preserving volatile terpenes due to low boiling points of solvents, allowing for low-temperature extraction and purging. Leads to flavorful, aromatic extracts like live resin. Relatively lower equipment cost than CO2. Can use fresh-frozen material ("live").
*   **Disadvantages:** **HIGH FLAMMABILITY/EXPLOSION RISK.** Requires specialized safety equipment (closed-loop systems, proper ventilation) and facilities. Potential for residual solvents if not purged properly (requires lab testing).
*   **Common Products:** Shatter, Wax, Budder/Badder, Crumble, Live Resin, Diamonds & Sauce.

### Ethanol Extraction {#ethanol-extraction}

*   **Process:** Uses ethanol (alcohol) as a solvent. Can be done cold, warm, or room temperature.
*   **Advantages:** Ethanol is efficient, effective for large volumes (especially hemp for CBD), relatively safe (GRAS - Generally Recognized As Safe), scalable. Cold ethanol extraction minimizes chlorophyll/wax pickup.
*   **Disadvantages:** Ethanol is polar and can co-extract undesirable water-soluble compounds like chlorophyll and waxes (especially when warm), often requiring post-processing (winterization, filtration). Can be less effective at preserving the most volatile terpenes compared to hydrocarbons.
*   **Common Products:** Tinctures, RSO (Rick Simpson Oil), distillate base oil, edibles, topicals.

### Solventless - Rosin Press {#rosin-press}

*   **Process:** Applies controlled heat and high pressure to cannabis flower, kief, or hash using specialized plates. The heat melts the resin, and the pressure squeezes it out.
*   **Advantages:** Completely solvent-free ("clean"). Preserves the full spectrum profile of the starting material. Relatively simple concept (though mastery takes skill).
*   **Disadvantages:** Yields can be lower compared to solvent methods, highly dependent on starting material quality and freshness. Can be labor-intensive for large scale.
*   **Common Products:** Flower Rosin, Hash Rosin, Live Rosin (from fresh-frozen hash).

### Solventless - Ice Water Hash (Bubble Hash) {#ice-water-hash}

*   **Process:** Uses ice, water, and agitation (manual or machine) to make trichomes brittle and break them off the plant material. The mixture is filtered through mesh bags of varying micron sizes to collect different grades of trichome heads.
*   **Advantages:** Solvent-free. High-quality starting material for pressing rosin ("hash rosin"). Full-melt grades can be dabbed directly.
*   **Disadvantages:** Labor-intensive process. Requires drying time for the collected hash. Quality heavily depends on starting material.
*   **Common Products:** Bubble Hash (various grades: full-melt, half-melt, food-grade), Hash Rosin (when pressed).

### Solventless - Dry Sift (Kief) {#dry-sift}

*   **Process:** Mechanically separates trichome heads from dried cannabis material by tumbling or sieving it over fine mesh screens.
*   **Advantages:** Solvent-free. Simplest solventless method. Collects kief which can be used as-is, pressed into hash, or pressed into rosin.
*   **Disadvantages:** Can contain more fine plant particulate matter than ice water hash, depending on screen size and technique. Yield and quality depend heavily on starting material and method.
*   **Common Products:** Kief, Pressed Hash, Dry Sift Rosin (when pressed).

### Post-Processing Techniques {#post-processing-techniques}

*   **Winterization:** Used to remove fats, waxes, and lipids from solvent-based extracts (esp. CO2, warm ethanol). Extract is dissolved in ethanol, chilled severely (freezer temps), causing waxes/fats to solidify (precipitate), then filtered out. Results in a cleaner, more stable oil.
*   **Distillation (Short-Path):** Used to isolate specific cannabinoids (usually THC or CBD) by heating crude oil under vacuum. Different compounds boil and evaporate at different temperatures, allowing separation.
    *   **Outcome:** Produces a very high-potency, refined oil (distillate) that is typically clear/light yellow and odorless/flavorless (terpenes are removed). Terpenes may be added back later.
*   **CRC (Color Remediation Column/Clay):** A filtration technique where extract (often BHO) is passed through a column containing filter media (e.g., silica gel, activated charcoal, bentonite clay, Magnesol).
    *   **Purpose:** Removes impurities like chlorophyll, lipids, oxidation products, and potentially some pesticides, resulting in a lighter color and potentially higher purity/stability.
    *   **Controversy:** Can be misused to make low-quality input look better. Improper use can strip desirable terpenes, affecting flavor/effect, or potentially leave filter media residue in the final product. Transparency about CRC use is debated.

## Products & Consumption Methods {#products-consumption-methods}

### Flower {#flower}

*   **Description:** Dried, cured buds of the cannabis plant. The most traditional form.
*   **Quality Assessment:** Look for vibrant color (can vary by strain), dense trichome coverage (frosty appearance), strong characteristic aroma (terpenes), slightly spongy texture (not too dry/wet), cleanly trimmed (few stems/leaves).
*   **Storage:** Airtight glass jar, cool, dark, dry place. Humidity packs (58-62% RH) recommended for long-term storage.
*   **Consumption:** Smoking (pipe, bong, joint, blunt), dry herb vaporization.

### Concentrates (General) {#concentrates-general}

*   **Description:** Products made by extracting cannabinoids and terpenes from flower, resulting in much higher potency than flower. Various textures and consistencies.
*   **Consumption:** Primarily vaporization/dabbing, sometimes added to flower or used in edibles.

### Concentrates - Specific Types {#concentrates-specific-types}

*   **Kief/Dry Sift:** Collected trichome heads (powder). Can be sprinkled on flower, pressed into hash, or pressed into rosin.
*   **Hash/Hashish:** Traditionally, compressed kief or resin glands. Can be smoked, vaped, or used in edibles. (Modern term also includes Ice Water Hash).
*   **Rosin:** Solventless extract made with heat and pressure. Can be made from flower, kief, or hash. "Live Rosin" is made from hash derived from fresh-frozen flower. Dabbed, vaped.
*   **Live Resin:** Solvent-based (usually BHO/PHO) extract made from fresh-frozen flower to preserve volatile terpenes. High flavor. Various consistencies (sauce, badder, sugar). Dabbed, vaped.
*   **Shatter:** Solvent-based extract (usually BHO) with a hard, stable, glass-like, translucent appearance. Breaks easily. Dabbed, vaped.
*   **Wax/Budder/Badder/Crumble:** Solvent-based extracts (usually BHO/PHO) with opaque, softer textures due to agitation during purging. Ranges from creamy (budder) to soft/waxy (wax) to dry/brittle (crumble). Dabbed, vaped.
*   **Distillate:** Highly refined, high-potency oil (often 90%+ THC or CBD) where cannabinoids are isolated via distillation. Terpenes are removed but often reintroduced. Used mainly in vape cartridges, edibles, tinctures.
*   **THCA Diamonds:** Crystalline structures of nearly pure THCA. Very potent when decarboxylated (heated). Often found mixed with terpene-rich "sauce". Dabbed, vaped.
*   **Terp Sauce / HTSFE (High Terpene Full Spectrum Extract) / HCFSE (High Cannabinoid Full Spectrum Extract):** Extracts focused on preserving a high concentration of terpenes along with cannabinoids. Sauce often refers to liquid terpenes with cannabinoid crystals (diamonds) mixed in. Dabbed, vaped.
*   **RSO (Rick Simpson Oil) / FECO (Full Extract Cannabis Oil):** Often ethanol-extracted, aiming to capture a very broad spectrum of plant compounds (including chlorophyll, fats). Typically dark, thick, tar-like. Usually ingested orally or applied topically, rarely smoked/vaped.

### Edibles {#edibles}

*   **Description:** Food or beverages infused with cannabis extracts (usually distillate or RSO/FECO).
*   **Pharmacokinetics:**
    *   **Onset:** Slow (30 mins - 2+ hours) due to digestion and liver metabolism.
    *   **Duration:** Long (4 - 8+ hours).
    *   **Metabolism:** THC is converted by the liver into 11-hydroxy-THC, a more potent metabolite, contributing to stronger effects compared to inhalation.
    *   **Bioavailability:** Generally low (4-12%) due to degradation and first-pass metabolism.
*   **Dosing:** **Start Low, Go Slow!** Standard starting dose often recommended is 2.5-5mg THC. Wait at least 1-2 hours before considering more. Individual factors (metabolism, tolerance, stomach contents) greatly influence effects.
*   **Formulations:**
    *   **Gummies/Candies:** Easy dosing, good flavor masking, shelf-stable.
    *   **Chocolates:** Potential for some faster sublingual absorption as it melts.
    *   **Baked Goods:** Can be harder to dose precisely (esp. homemade).
    *   **Beverages:** Often use nanoemulsion for potentially faster onset (15-30 mins).
    *   **Tinctures/Oils (Swallowed):** Function like other edibles if swallowed directly.
    *   **Capsules:** Simple, discreet dosing, function like other edibles.

### Tinctures / Sublingual Oils {#tinctures-sublingual-oils}

*   **Description:** Liquid cannabis extracts, often oil-based (MCT, olive oil) or alcohol-based, intended for sublingual absorption.
*   **Administration:** Held under the tongue for 60-90 seconds before swallowing.
*   **Pharmacokinetics:**
    *   **Onset:** Faster than edibles (typically 15-45 minutes) as cannabinoids are absorbed through blood vessels under the tongue.
    *   **Bioavailability:** Potentially higher than edibles as it partially bypasses first-pass liver metabolism.
    *   **Duration:** Often shorter than edibles but longer than inhalation (e.g., 2-5 hours).
*   **Use:** Allows for precise dosing (using dropper), faster onset than edibles.

### Topicals {#topicals}

*   **Description:** Creams, lotions, balms, salves infused with cannabis extracts, applied to the skin.
*   **Mechanism:** Interact primarily with local cannabinoid receptors in the skin and underlying tissues.
*   **Effects:** Provide localized relief (e.g., for muscle soreness, joint pain, skin conditions) **without significant systemic absorption or psychoactive effects.** (Most cannabinoids don't readily penetrate the skin barrier into the bloodstream).
*   **Exception - Transdermal Patches:** Specifically designed with permeation enhancers to deliver cannabinoids *through* the skin into the bloodstream for systemic, long-lasting effects (similar to nicotine patches). **These CAN be psychoactive.**

### Suppositories {#suppositories}

*   **Description:** Cannabis extract infused into a base that melts at body temperature, inserted rectally or vaginally.
*   **Mechanism:** Cannabinoids are absorbed directly into the bloodstream via mucous membranes.
*   **Advantages:** High bioavailability (especially rectal), bypasses first-pass liver metabolism. Can provide systemic effects potentially with reduced psychoactivity (especially rectal). Useful for localized issues (pelvic pain, GI issues) or when oral intake is difficult.
*   **Onset/Duration:** Variable, but potentially faster systemic onset than edibles.

### Inhalation Methods {#inhalation-methods}

*   **Smoking (Joints, Pipes, Bongs):**
    *   **Mechanism:** Combustion (burning) plant material.
    *   **Onset:** Very fast (seconds to minutes).
    *   **Duration:** Shorter (1-3 hours).
    *   **Downsides:** Produces combustion byproducts (tar, carcinogens). Can destroy some terpenes due to high heat.
*   **Vaporizing (Dry Herb):**
    *   **Mechanism:** Heats flower below combustion point to release cannabinoids/terpenes as vapor.
    *   **Onset:** Very fast (seconds to minutes).
    *   **Duration:** Shorter (1-3 hours).
    *   **Advantages:** Avoids combustion byproducts, potentially better flavor/terpene preservation (esp. at controlled temps), more efficient use of material.
*   **Vaporizing (Concentrate Pens/Cartridges):**
    *   **Mechanism:** Battery heats a coil that vaporizes cannabis oil (distillate, live resin, rosin) in a cartridge.
    *   **Onset:** Very fast (seconds to minutes).
    *   **Duration:** Shorter (1-3 hours).
    *   **Advantages:** Convenient, discreet, potent. Different oil types offer different experiences (potency vs. flavor/spectrum).
    *   **Concerns:** Illicit market risks (additives, heavy metals), hardware quality, potential for high tolerance development.
*   **Dabbing:**
    *   **Mechanism:** Vaporizing concentrates on a heated surface (nail/banger), typically attached to a water pipe (dab rig).
    *   **Onset:** Very fast (seconds to minutes), often perceived as most intense.
    *   **Duration:** Shorter (1-3 hours).
    *   **Use:** For consuming potent concentrates. Temperature control ("low-temp" vs "high-temp") significantly affects flavor and harshness. Requires specialized equipment.

## Physiology & Effects {#physiology-effects}

### Tolerance {#tolerance}

*   **Definition:** A diminished response to a drug after repeated administration. With cannabis, this means needing higher doses of THC to achieve the same desired effects.
*   **Mechanism:** Primarily due to the downregulation (reduction in number and sensitivity) of CB1 receptors in the brain in response to chronic THC exposure.
*   **Management:** Tolerance can be lowered or reset by reducing frequency/dosage or taking a period of abstinence (tolerance break or "T-break"). The duration needed varies.

### Pharmacokinetics Summary by Method {#pharmacokinetics-summary}

| Method                     | Onset Time        | Duration         | Bioavailability | Key Feature                         |
| :------------------------- | :---------------- | :--------------- | :-------------- | :---------------------------------- |
| **Inhalation (Smoke/Vape)** | Seconds - Minutes | 1 - 3 hours      | Moderate-High   | Fastest onset                       |
| **Oral (Edibles)** | 30 min - 2+ hours | 4 - 8+ hours     | Low             | Strongest (11-OH-THC), longest duration |
| **Sublingual (Tincture)** | 15 - 45 minutes   | 2 - 5 hours      | Moderate        | Faster than oral, bypasses some liver |
| **Topical (Standard)** | Minutes - Hour    | Variable (local) | Very Low        | Localized effects, non-psychoactive |
| **Transdermal Patch** | 30 min - 2 hours  | 8 - 12+ hours    | Moderate        | Systemic, slow sustained release    |
| **Suppository** | 15 - 60 minutes   | Variable         | High            | Bypasses liver, systemic/local    |

## Customer Service & Sales Techniques {#customer-service-sales}

### Needs Assessment {#needs-assessment}

*   **Goal:** Understand the customer's goals, experience level, preferences, and context (Set & Setting).
*   **Method:** Ask open-ended questions ("What brings you in?", "What effects/experience are you looking for?", "What's your experience with cannabis?", "How do you prefer to consume?"). Practice active listening.

### Adapting to Customer Types {#adapting-customer-types}

*   **Novice:** Educate on basics (methods, dosing, onset/duration). Emphasize "Start Low, Go Slow." Recommend lower potency products (low THC flower, 5mg edibles, 1:1 CBD:THC). Keep explanations simple and clear.
*   **Experienced:** May know what they want. Engage about specific chemovars, terpenes, new products. Can discuss more advanced topics like concentrates or specific effects.
*   **Medical Focus:** Listen empathetically. **NEVER give medical advice or make claims.** Focus on product features (cannabinoids, terpenes, delivery methods) potentially relevant to *reported* symptoms/goals based on general knowledge/research. Stress importance of consulting a healthcare professional. Maintain privacy and sensitivity.

### Product Recommendations (Use Case Associations - General Guidance) {#product-recommendations}

*   **Social / Energy / Creativity:** Often associated with "Sativa"-leaning profiles high in **Limonene**, **Pinene**, or **Terpinolene**. Strains like Sour Diesel, Jack Herer, Durban Poison, Green Crack are common examples.
*   **Relaxation / Calm / Sleep Support:** Often associated with "Indica"-leaning profiles high in **Myrcene**, **Linalool**, or sometimes **Caryophyllene**. Products with **CBN** are specifically sought for sleep. Strains like Granddaddy Purple, Northern Lights, OG Kush, Bubba Kush fit this category.
*   **Focus:** Sometimes linked to **Pinene** for alertness or balanced hybrids. Effects are highly individual.
*   **General Wellness / Reduced Anxiety:** Often involves **CBD**, either alone or in balanced ratios with THC (e.g., Type II or Type III chemovars). **Linalool** and **Limonene** may also be relevant.
*   **Disclaimer:** Always remind customers that effects are subjective and depend on individual factors. Encourage starting low with new products/profiles.

### Handling Complaints & Difficult Interactions {#handling-complaints}

*   **Listen Actively:** Understand the customer's issue fully without interrupting.
*   **Empathize:** Acknowledge their frustration ("I understand that's frustrating...").
*   **Stay Calm:** Maintain professionalism, even if the customer is upset. Don't argue.
*   **Troubleshoot/Educate:** Offer potential explanations (e.g., edible onset time, vape connection) or usage tips where appropriate, without blaming.
*   **Know Policy:** Understand the dispensary's return/exchange policy.
*   **Escalate:** Involve a manager if the situation becomes abusive, requires policy exceptions, or is beyond your scope to resolve.
*   **De-escalate:** Focus on finding a resolution within policy, maintain a calm tone and body language.

### Ethical Sales {#ethical-sales}

*   **Focus on Needs:** Recommendations should align with the customer's stated goals and experience level.
*   **Honesty:** Accurately represent products and potential effects. Don't over-promise or make medical claims.
*   **Upselling/Cross-selling:** Should be relevant and genuinely beneficial (e.g., suggesting a grinder for flower, a battery for a cart, or a complementary product), not pressured or focused solely on higher price/margin items. Avoid pushing unsuitable products (e.g., dabs for a novice).

## Compliance, Safety & Regulations {#compliance-safety-regulations}

### ID Verification {#id-verification}

*   **Requirement:** Mandatory check of valid, unexpired, government-issued photo ID for *every* customer, *every* time to verify legal age (e.g., 21+ recreational, 18+ or 21+ medical depending on state).
*   **Verification Steps:** Check DOB, expiration date, photo match, look for signs of tampering, examine security features (holograms, microprint).

### Purchase Limits {#purchase-limits}

*   **Basis:** State laws set limits on the amount of cannabis product a customer can purchase per day/transaction.
*   **Equivalency:** Limits are often stated in flower weight, with rules defining how other forms (concentrates, edibles) convert to that flower equivalent (e.g., 1g concentrate = 5g flower, 100mg edible THC = 1g flower - varies by state).
*   **Looping:** An illegal attempt by customers to exceed daily limits by making multiple purchases. Prevented through POS tracking and budtender vigilance.

### Packaging & Labeling {#packaging-labeling}

*   **Child-Resistant Packaging:** Required in most states, especially for edibles, to prevent accidental ingestion by children.
*   **Label Requirements:** Vary by state but typically include: Product identity, Net weight/volume, THC/CBD content (mg per serving and per package), Serving size (edibles), Batch/Lot number, Production/Expiration dates, Ingredient list, Allergen warnings, Licensed cultivator/processor info, Government warnings, Universal cannabis symbol.

### Responsible Consumption Counseling {#responsible-consumption-counseling}

*   **Impairment:** Advise customers **NEVER** to drive or operate heavy machinery under the influence.
*   **Start Low, Go Slow:** Crucial advice, especially for edibles and new users.
*   **Safe Storage:** Emphasize keeping products securely stored, locked away, out of sight and reach of children and pets.
*   **Drug Interactions:** Advise customers to consult their doctor if taking other medications, due to potential interactions (esp. with CBD and liver enzymes).
*   **Pregnancy/Breastfeeding:** Advise against use during pregnancy or while breastfeeding.

### Inventory & Tracking {#inventory-tracking}

*   **Seed-to-Sale Systems (e.g., METRC):** State-mandated systems that track every plant and product from cultivation through processing, testing, and final retail sale. Ensures accountability and prevents diversion to illicit market. Budtenders interact with the Point-of-Sale (POS) system linked to this tracking.

## Advanced Quality Assessment {#advanced-quality-assessment}

### Lab Testing - Importance {#lab-testing-importance}

*   **Purpose:** Independent, third-party testing verifies product potency (cannabinoids) and ensures safety by screening for harmful contaminants. Crucial for consumer trust and regulatory compliance.

### Lab Testing Methods {#lab-testing-methods}

*   **HPLC (High-Performance Liquid Chromatography):** Gold standard for **potency testing** (quantifying cannabinoids like THC, THCA, CBD, CBDA) because it doesn't require high heat, preserving acidic forms.
*   **GC-MS (Gas Chromatography-Mass Spectrometry):** Used primarily for **terpene profiling** and **residual solvent analysis**, as it handles volatile compounds well. Also used for pesticide analysis. (Note: High heat decarboxylates acids, so not ideal for primary potency of THCA/CBDA).
*   **ICP-MS (Inductively Coupled Plasma Mass Spectrometry):** Used for detecting and quantifying trace levels of **heavy metals** (Lead, Arsenic, Cadmium, Mercury).
*   **Microbial Testing (qPCR, Plating):** Screens for harmful bacteria (like Salmonella, E. coli) and unacceptable levels of yeast and mold (TYM - Total Yeast & Mold).
*   **Mycotoxin Testing:** Screens for toxic substances produced by certain molds.
*   **Water Activity (aW) Testing:** Measures the available water in flower, indicating potential for microbial growth and predicting shelf stability (more reliable than just moisture content).

### Reading a COA (Certificate of Analysis) {#reading-coa}

*   **Key Sections:**
    *   **Header:** Lab info, Client (Producer) info, Sample ID, Batch Number, Dates (Collected, Tested, Reported).
    *   **Cannabinoid Profile:** Lists concentrations (often % or mg/g) of THC, THCA, CBD, CBDA, CBG, CBN, etc. Total THC often calculated as (THCA * 0.877) + Δ9-THC.
    *   **Terpene Profile:** Lists concentrations (% or ppm) of dominant terpenes. Helps predict aroma, flavor, potential nuanced effects.
    *   **Contaminant Testing:** Sections for Pesticides, Residual Solvents, Microbials, Mycotoxins, Heavy Metals. Results typically show Analyte, Limit, Result (value or ND), Status (Pass/Fail).
*   **Important Terms:**
    *   **ND (Non-Detect):** Analyte not found at or above the lab's detection limit (LOD).
    *   **LOD (Limit of Detection):** Smallest amount the test can reliably detect.
    *   **LOQ (Limit of Quantification):** Smallest amount the test can reliably and accurately measure. Results between LOD and LOQ (<LOQ) mean detected but too low to quantify precisely.
    *   **PASS/FAIL:** Indicates if the result is below (Pass) or above (Fail) the state-mandated safety limit for that contaminant.
*   **Verification:** Ensure Batch Number on COA matches product packaging. Check test date for recency.

## Troubleshooting Common Issues {#troubleshooting-common-issues}

### Vape Pens {#troubleshooting-vape-pens}

*   **Blinking Light (e.g., 3 or 5 times):** Often indicates a connection issue (cartridge too tight/loose, dirty contacts) or short circuit. Try cleaning contacts (battery/cart) with isopropyl alcohol, slightly adjusting cart tightness. May also indicate low battery on some models.
*   **No Vapor (Battery Lights Up):** Likely a clogged cartridge airway. Try the battery's preheat function (if available), gently warm cart (roll in hands), or carefully clear mouthpiece opening with a paperclip.
*   **Burnt Taste:** Usually caused by voltage/temperature setting being too high, firing an empty/near-empty cart, or chain-vaping too quickly without letting wick re-saturate. Suggest lower setting, ensuring cart has oil, pacing puffs.
*   **Leaking Cartridge:** Can be due to damage, overfilling, drastic temperature/pressure changes (like on airplanes), or being stored improperly (not upright).

### Edibles {#troubleshooting-edibles}

*   **No Effect / Delayed Effect:** Remind user onset takes 30min - 2+ hours. Ask about dose, time waited, food consumed (empty stomach = faster onset; high-fat meal can delay but sometimes enhance absorption). Advise patience before redosing. Metabolism varies greatly.
*   **Too Strong Effect:** Advise user to stay calm, hydrate, find a comfortable/safe place, potentially consume some CBD (may counteract some THC anxiety), distract themselves. Effects will subside over time. Counsel on lower dosing next time.

### Flower {#troubleshooting-flower}

*   **Mold/Mildew:** Identify visual signs (fuzz, powder) and smell (musty/ammonia). Advise customer **not to consume** and follow store policy for returns/exchanges if applicable. Educate on proper storage.
*   **Harsh Smoke:** Likely improper flush or cure. Explain this possibility.

## Cannabis History {#cannabis-history}

*   **Ancient Origins:** Earliest uses traced to Central/East Asia thousands of years ago (fiber, food, medicine, ritual).
*   **Western Introduction:** Dr. William Brooke O'Shaughnessy introduced medicinal uses observed in India to Western medicine (~1830s-1840s). Widely used in Western pharmacopeias in late 19th/early 20th century.
*   **US Prohibition:** Fueled by "Reefer Madness" propaganda, racism, and lobbying.
    *   **Marihuana Tax Act (1937):** Driven by Harry Anslinger, effectively criminalized cannabis via prohibitive taxes/regulations.
    *   **Controlled Substances Act (1970):** Classified cannabis as Schedule I (high abuse potential, no accepted medical use), the most restrictive category, where it remains federally today.
*   **Key Science:** Professor Raphael Mechoulam (Israel) first isolated and synthesized THC in 1964.
*   **Modern Legalization:**
    *   **Medical:** California (Prop 215, 1996) was the first US state. Many others followed.
    *   **Recreational:** Colorado and Washington (2012) were the first US states. Uruguay (2013) was the first country nationwide. Canada followed nationally in 2018.

## Emerging Trends {#emerging-trends}

*   **Minor Cannabinoids:** Increased focus on products highlighting CBN (sleep), CBG (focus, wellness), THCV (appetite suppression?), CBC, etc., often in formulated blends.
*   **Hemp-Derived Cannabinoids:** Explosion of products containing Delta-8 THC, Delta-10 THC, HHC, THCO, etc., derived from hemp CBD. Legal status varies greatly by state and remains federally complex. Often less regulated/tested than state-legal cannabis.
*   **Product Innovation:**
    *   **Infused Pre-Rolls:** Flower mixed with or coated in concentrates (kief, distillate, rosin) for higher potency.
    *   **Beverages:** Growing popularity, often using nanoemulsion for faster onset. Seen as alcohol alternative.
    *   **Solventless:** Increased demand for high-quality solventless extracts like Live Rosin.
*   **Consumer Behavior:** Shift towards wellness applications (stress, sleep, pain), interest in specific cannabinoids/terpenes beyond just high THC, demographic shifts (e.g., growth in female consumption).
*   **Research:** Focus on minor cannabinoids, terpene interactions (Entourage Effect), and therapeutic applications for specific conditions.

## Legal Nuances & Social Equity {#legal-social-equity}

### Legal Nuances {#legal-nuances}

*   **State vs. Federal:** Cannabis remains illegal federally (Schedule I), creating conflicts with state laws and issues like banking, interstate commerce, and federal employment.
*   **Medical vs. Recreational:** Programs often differ in qualifying conditions, possession limits, potency caps, taxation, age limits, and product availability.
*   **Hemp Cannabinoids:** Legal landscape is complex and rapidly evolving. Products may lack rigorous testing and consistent regulation compared to state-licensed cannabis.

### Social Equity {#social-equity}

*   **Goal:** Address the historical harms of cannabis prohibition, which disproportionately affected minority communities. Aims to provide opportunities for these communities to participate in the legal industry.
*   **Mechanisms:** Vary by state but may include licensing priority, reduced fees, technical assistance, funding, and community reinvestment programs for eligible applicants (often based on prior cannabis convictions, residency in impacted areas, or income level).
`;
// --- End Markdown Content ---

// --- Corrected Table of Contents Data ---
// These IDs should now match what rehype-slug generates by default
const tocItems = [
    { title: "Cannabis Science Fundamentals", id: "cannabis-science-fundamentals" },
    { title: "Plant Anatomy", id: "plant-anatomy" },
    { title: "Classification", id: "classification" },
    { title: "Basic Cultivation Concepts", id: "basic-cultivation-concepts" },
    { title: "Extraction Methods", id: "extraction-methods" },
    { title: "Products & Consumption Methods", id: "products-consumption-methods" }, // Corrected ID
    { title: "Physiology & Effects", id: "physiology-effects" }, // Corrected ID
    { title: "Customer Service & Sales Techniques", id: "customer-service-sales-techniques" }, // Corrected ID
    { title: "Compliance, Safety & Regulations", id: "compliance-safety-regulations" }, // Corrected ID
    { title: "Advanced Quality Assessment", id: "advanced-quality-assessment" },
    { title: "Troubleshooting Common Issues", id: "troubleshooting-common-issues" },
    { title: "Cannabis History", id: "cannabis-history" },
    { title: "Emerging Trends", id: "emerging-trends" },
    { title: "Legal Nuances & Social Equity", id: "legal-nuances-social-equity" }, // Corrected ID
];
// --- End TOC Data ---

// Simple debounce function (keep as before)
function debounce(func, wait) {
    let timeoutId = null; // Variable to store the timeout ID

    // The debounced function
    const debouncedFunc = function executedFunction(...args) {
        // Clear the previous timeout if it exists
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        // Set a new timeout
        timeoutId = setTimeout(() => {
            timeoutId = null; // Clear the ID after execution
            func.apply(this, args); // Call the original function
        }, wait);
    };

    // Add a cancel method to the debounced function
    debouncedFunc.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debouncedFunc;
}

// --- Highlighting Function ---
// Moved outside component for clarity, wrapped in useCallback later if needed inside component scope
const highlightNode = (node, highlight) => {
    if (!highlight || !highlight.trim()) { // Added check for empty/whitespace highlight
        return node; // No highlighting needed
    }

    const processChildren = (children) => {
        return React.Children.map(children, child => {
            if (typeof child === 'string') {
                // Escape regex special characters in the highlight term
                const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedHighlight})`, 'gi');
                // Only highlight if the regex actually matches something
                if (regex.test(child)) {
                    return child.split(regex).map((part, index) =>
                        // Check if the part matches the regex (case-insensitive)
                        regex.test(part) && part.toLowerCase() === highlight.toLowerCase()
                            ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-500 dark:text-black px-0.5">{part}</mark>
                            : part
                    );
                }
                return child; // Return original string if no match
            }
            // If it's a valid React element with children, recurse
            if (React.isValidElement(child) && child.props.children) {
                 // Avoid recursing into potentially complex or non-text elements like code blocks or custom components
                 // Also check if child.type exists before accessing its properties
                 if (child.type && (child.type === 'code' || child.type === 'pre' || typeof child.props.children === 'function')) {
                    return child;
                 }
                // Ensure children are processable before cloning
                const processedChildren = processChildren(child.props.children);
                return React.cloneElement(child, {
                    ...child.props,
                    children: processedChildren
                });
            }
            // Return other nodes (like empty elements, numbers, etc.) as is
            return child;
        });
    };

    // Ensure the initial node is processable
    if (typeof node === 'string' || (React.isValidElement(node) && node.props.children)) {
        return processChildren(node);
    } else if (Array.isArray(node)) { // Handle cases where node might be an array of children directly
         return processChildren(node);
    }

    return node; // Return node if it's not highlightable
};


function ResourceGuidePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const contentRef = useRef(null);

    // Memoize the debounced function itself
    const debouncedSetSearch = useMemo(
        () => debounce(setDebouncedSearchTerm, 300),
        [] // No dependencies needed here, setDebouncedSearchTerm is stable
    );

    // Effect to call the debounced function and handle cleanup
    useEffect(() => {
        debouncedSetSearch(searchTerm);
        // Return a cleanup function that calls the cancel method
        return () => {
            debouncedSetSearch.cancel();
        };
    }, [searchTerm, debouncedSetSearch]);


    // --- Markdown Components ---
    // Use useCallback for components dependent on debouncedSearchTerm if performance becomes an issue,
    // but useMemo is generally sufficient here as the dependency changes infrequently.
    const components = useMemo(() => ({
        // Ensure IDs from rehype-slug are passed down correctly
        h1: ({ node, children, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-gray-300 dark:border-gray-700 dark:text-gray-100" {...props}>{highlightNode(children, debouncedSearchTerm)}</h1>,
        h2: ({ node, children, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200" {...props}>{highlightNode(children, debouncedSearchTerm)}</h2>,
        h3: ({ node, children, ...props }) => <h3 className="text-xl font-semibold mt-5 mb-2 dark:text-gray-200" {...props}>{highlightNode(children, debouncedSearchTerm)}</h3>,
        p: ({ node, children, ...props }) => <p className="mb-4 leading-relaxed dark:text-gray-300" {...props}>{highlightNode(children, debouncedSearchTerm)}</p>,
        ul: ({ node, children, ...props }) => <ul className="list-disc list-inside mb-4 pl-4 space-y-1 dark:text-gray-300" {...props}>{highlightNode(children, debouncedSearchTerm)}</ul>,
        ol: ({ node, children, ...props }) => <ol className="list-decimal list-inside mb-4 pl-4 space-y-1 dark:text-gray-300" {...props}>{highlightNode(children, debouncedSearchTerm)}</ol>,
        li: ({ node, children, ...props }) => <li className="mb-1" {...props}>{highlightNode(children, debouncedSearchTerm)}</li>,
        a: ({ node, children, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props}>{highlightNode(children, debouncedSearchTerm)}</a>,
        strong: ({ node, children, ...props }) => <strong className="font-semibold dark:text-gray-200" {...props}>{highlightNode(children, debouncedSearchTerm)}</strong>,
        em: ({ node, children, ...props }) => <em className="italic" {...props}>{highlightNode(children, debouncedSearchTerm)}</em>,
        // Keep code block logic as is, ensure highlighting doesn't break it
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');
            // Apply highlighting only if it's inline code, not a block
            const highlightedChildren = inline ? highlightNode(children, debouncedSearchTerm) : children;

            return !inline && match ? (
                 // Keep existing code block rendering logic (e.g., syntax highlighting component)
                 // For simplicity, just rendering pre/code tags here
                 <pre className={`bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm ${className || ''}`} {...props}>
                     <code>{codeText}</code>
                 </pre>
            ) : (
                <code className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm ${inline ? 'inline' : ''} ${className || ''}`} {...props}>
                    {highlightedChildren}
                </code>
            );
        },
        // Apply highlighting to table cells
        td: ({ node, children, ...props }) => <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600" {...props}>{highlightNode(children, debouncedSearchTerm)}</td>,
        th: ({ node, children, ...props }) => <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-300 dark:border-gray-600" {...props}>{highlightNode(children, debouncedSearchTerm)}</th>,
        table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border-collapse border border-gray-300 dark:border-gray-600" {...props} /></div>,
        thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900" {...props} />,
        tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-800" {...props} />,
    }), [debouncedSearchTerm]);


  // --- Updated handleTocClick with Header Offset ---
  // useCallback is appropriate here as the function itself doesn't change
  const handleTocClick = useCallback((id) => (event) => {
    event.preventDefault();
    // Use try/catch for robustness in case element is not found
    try {
        const element = document.getElementById(id);
        if (element) {
            const headerHeight = 64; // Height of the sticky header (adjust if needed)
            const extraPadding = 20; // Add a little extra space below the header
            const offset = headerHeight + extraPadding;

            const elementPosition = element.getBoundingClientRect().top + window.scrollY; // More reliable position calculation
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            console.warn(`TOC Click: Element with ID '${id}' not found.`);
            // Optional: Fallback using querySelector if needed, though IDs should be reliable now
            // const elementByQuery = document.querySelector(`[id="${CSS.escape(id)}"]`); // Use CSS.escape for complex IDs
            // if (elementByQuery) { /* ... scroll logic ... */ }
        }
    } catch (error) {
        console.error("Error scrolling to element:", error);
    }
 }, []); // Empty dependency array is correct

    // --- JSX Return ---
    return (
        // Added dark mode classes to container if needed, assuming handled globally
        <Container maxWidth="lg" className="flex flex-col md:flex-row gap-6 md:gap-8 mt-4 mb-4">
            {/* Sidebar */}
            <Paper
                elevation={2}
                // Ensure sidebar scrolls independently and doesn't exceed viewport height
                className="w-full md:w-64 lg:w-72 flex-shrink-0 p-4 sticky top-[calc(theme(space.16)+theme(space.4))] /* Adjust top based on actual header height + desired gap */ self-start hidden md:block max-h-[calc(100vh-theme(space.16)-theme(space.8))] /* Adjust max-h based on header height + top/bottom gaps */ overflow-y-auto dark:bg-gray-800"
            >
                 <Typography variant="h6" className="!mb-3 !font-semibold dark:text-gray-200 border-b pb-2 border-gray-300 dark:border-gray-700">Contents</Typography>
                <List dense component="nav" aria-label="Table of contents">
                    {tocItems.map((item) => (
                        <ListItem key={item.id} disablePadding className="mb-0.5">
                            {/* Use ButtonBase or ListItemButton for better accessibility/hover effects */}
                            <MuiLink
                                href={`#${item.id}`}
                                onClick={handleTocClick(item.id)}
                                underline="hover" // Consistent underline behavior
                                className="!text-sm !text-gray-700 dark:!text-gray-300 hover:!text-blue-600 dark:hover:!text-blue-400 w-full block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" // Added padding/hover styles
                            >
                                {/* Removed ListItemText for simpler structure, Link text is sufficient */}
                                {item.title}
                            </MuiLink>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Main Content Area */}
            <Box component="main" className="flex-grow min-w-0"> {/* Use main tag for semantics */}
                 <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search Guide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search Resource Guide" // Accessibility
                    InputProps={{
                        startAdornment: ( <InputAdornment position="start"><SearchIcon /></InputAdornment> ),
                        className: "dark:bg-gray-700 dark:text-gray-200 dark:[&>fieldset]:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500" // Added focus ring
                    }}
                    className="mb-6 sticky top-16 z-10 bg-white dark:bg-gray-900 py-2" // Make search sticky below header
                />
                {/* Removed Box wrapper around ReactMarkdown, apply prose classes directly if needed or via parent */}
                <article ref={contentRef} className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none"> {/* Use article tag */}
                    <ReactMarkdown
                        components={components}
                        rehypePlugins={[rehypeRaw, rehypeSlug]}
                        // Ensure markdownContent is passed correctly
                        // children={markdownContent} // Use children prop for content
                    >
                        {markdownContent /* Pass content as children */}
                    </ReactMarkdown>
                </article>
            </Box>
        </Container>
    );
}

export default ResourceGuidePage;
