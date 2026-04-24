export const DEFAULT_PRICING = {
  roofing: {
    baseRatePerSQ: 566,
    twoStoryRate: 45,
    pitch712Rate: 55,
    pitch1012Rate: 85,
    extraLayerRate: 65,
    lineItems: [
      { id: 'sky_inst',   label: 'Skylight Install / Replacement',    rate: 450,  unit: 'ea' },
      { id: 'sky_flash',  label: 'Skylight Flashing Kit',             rate: 185,  unit: 'ea' },
      { id: 'cap_base',   label: 'Cap & Base Sheet System',           rate: 95,   unit: 'SQ' },
      { id: 'ridge_vent', label: 'Ridge Vent',                        rate: 8,    unit: 'LF' },
      { id: 'osb_deck',   label: 'OSB / Decking Replacement',         rate: 3.5,  unit: 'sqft' },
      { id: 'osb_layover',label: 'OSB Layover',                       rate: 2.5,  unit: 'sqft' },
      { id: 'plank_rep',  label: 'Plank Deck Repair',                 rate: 4.5,  unit: 'sqft' },
      { id: 'wall_flash', label: 'Wall Flashing (beyond 40 LF)',      rate: 12,   unit: 'LF' },
      { id: 'step_flash', label: 'Step Flashing Add/Replace',         rate: 8,    unit: 'LF' },
      { id: 'ice_water',  label: 'Ice & Water (beyond 400 sqft)',     rate: 1.8,  unit: 'sqft' },
      { id: 'chim_sm',    label: 'Additional Chimney – Small',        rate: 285,  unit: 'ea' },
      { id: 'chim_md',    label: 'Additional Chimney – Medium',       rate: 425,  unit: 'ea' },
      { id: 'chim_lg',    label: 'Additional Chimney – Large',        rate: 575,  unit: 'ea' },
      { id: 'chim_crick', label: 'Chimney Cricket Build',             rate: 650,  unit: 'ea' },
      { id: 'copper_sm',  label: 'True Copper Flashing – Small',      rate: 485,  unit: 'ea' },
      { id: 'copper_av',  label: 'True Copper Flashing – Average',    rate: 725,  unit: 'ea' },
      { id: 'copper_lg',  label: 'True Copper Flashing – Large',      rate: 985,  unit: 'ea' },
      { id: 'alum_val',   label: 'Aluminum Valley Metal',             rate: 6,    unit: 'LF' },
      { id: 'cop_val',    label: 'Copper Valley Metal',               rate: 18,   unit: 'LF' },
    ],
    // Accessories — included in square pricing, tracked for production ordering
    accessories: [
      { id: 'acc_drip',    label: 'Drip Edge' },
      { id: 'acc_box',     label: 'Box Vent' },
      { id: 'acc_turbine', label: 'Turbine Vent' },
      { id: 'acc_broan',   label: 'Broan Vent' },
      { id: 'acc_wall',    label: 'Wall Flashing' },
      { id: 'acc_chim',    label: 'Chimney Flashing' },
      { id: 'acc_pipe',    label: 'Pipe Jack' },
    ],
  },

  siding: {
    tiers: [
      { id: 'standard', label: 'Standard', spec: '.40mm thickness', price: 210 },
      { id: 'designer', label: 'Designer', spec: '.42mm thickness', price: 250 },
      { id: 'premium',  label: 'Premium',  spec: '.44mm thickness', price: 295 },
    ],
    tearOffRate: 35,
    lineItems: [
      { id: 's_starter',  label: 'Starter Strip',         rate: 28,  unit: 'LF' },
      { id: 's_sill',     label: 'Sill Trim / Undersill', rate: 22,  unit: 'LF' },
      { id: 's_jch',      label: 'J-Channel',             rate: 18,  unit: 'LF' },
      { id: 's_out_corn', label: 'Outside Corner Posts',  rate: 38,  unit: 'ea' },
      { id: 's_in_corn',  label: 'Inside Corner Posts',   rate: 35,  unit: 'ea' },
      { id: 's_fch',      label: 'F-Channel',             rate: 16,  unit: 'LF' },
      { id: 's_util',     label: 'Utility Trim',          rate: 24,  unit: 'LF' },
      { id: 's_drip',     label: 'Drip Cap',              rate: 14,  unit: 'LF' },
      { id: 's_dryer',    label: 'Dryer Vent',            rate: 85,  unit: 'ea' },
      { id: 's_bath',     label: 'Bathroom Vent',         rate: 95,  unit: 'ea' },
      { id: 's_gable',    label: 'Gable Vent Blocks',     rate: 45,  unit: 'ea' },
      { id: 's_light',    label: 'Light / Mount Blocks',  rate: 28,  unit: 'ea' },
      { id: 's_foam',     label: 'Foam Board Insulation', rate: 1.2, unit: 'sqft' },
    ],
  },

  soffit: {
    lineItems: [
      { id: 'sof_panel', label: 'Soffit Panel',            rate: 2.8, unit: 'sqft' },
      { id: 'sof_fch',   label: 'F-Channel for Soffit',    rate: 16,  unit: 'LF' },
      { id: 'sof_jch',   label: 'J-Channel for Soffit',    rate: 18,  unit: 'LF' },
      { id: 'sof_vent',  label: 'Vented Soffit Panels',    rate: 3.5, unit: 'sqft' },
      { id: 'sof_tear',  label: 'Soffit Tear-Off',         rate: 1.1, unit: 'sqft' },
    ],
  },

  fascia: {
    lineItems: [
      { id: 'f_metal', label: 'Fascia Metal',       rate: 3.8, unit: 'LF' },
      { id: 'f_wood',  label: 'Wood Fascia Board',  rate: 5.2, unit: 'LF' },
      { id: 'f_sub',   label: 'Sub Fascia Repair',  rate: 4.5, unit: 'LF' },
      { id: 'f_coil',  label: 'Trim Coil',          rate: 2.2, unit: 'LF' },
    ],
  },

  gutter: {
    lineItems: [
      { id: 'g_gut',    label: 'Gutters',               rate: 9,  unit: 'LF' },
      { id: 'g_ds',     label: 'Downspouts',            rate: 6.5, unit: 'LF' },
      { id: 'g_ext',    label: 'Downspout Extensions',  rate: 18, unit: 'ea' },
      { id: 'g_inc',    label: 'Inside Corners',        rate: 22, unit: 'ea' },
      { id: 'g_outc',   label: 'Outside Corners',       rate: 22, unit: 'ea' },
      { id: 'g_end',    label: 'End Caps',              rate: 12, unit: 'ea' },
      { id: 'g_elb',    label: 'Elbows',                rate: 14, unit: 'ea' },
      { id: 'g_splash', label: 'Splash Blocks',         rate: 28, unit: 'ea' },
      { id: 'g_popup',  label: 'Pop-Up Drains',         rate: 55, unit: 'ea' },
    ],
  },
};
