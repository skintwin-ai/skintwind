// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

/**
 * Skintwind Worker - REST API for skincare supply chain
 * 
 * This worker demonstrates the skintwind extension, providing endpoints
 * to query salons, procedures, and formulations in a skincare supply chain.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Root - API documentation
      if (path === '/') {
        return new Response(JSON.stringify({
          name: 'Skintwind API',
          version: '1.0.0',
          description: 'Skincare supply chain application built with workerd',
          endpoints: {
            '/': 'API documentation',
            '/salons': 'Get all salons',
            '/salon/{id}': 'Get specific salon',
            '/salon/{id}/procedures': 'Get procedures for salon',
            '/labs': 'Get production labs',
            '/procedure/{id}': 'Get procedure details with cost',
            '/procedures': 'Query procedures (skinType, minDuration, maxDuration, maxPrice)',
            '/formulation/{id}': 'Get formulation details',
            '/formulations': 'Query formulations (type, skinType, benefit, maxPrice)',
            '/query/salons': 'Query salons (specialty, city, cooperativeId, certification)',
          },
          examples: {
            salons: 'GET /salons',
            salonById: 'GET /salon/salon1',
            salonProcedures: 'GET /salon/salon1/procedures',
            queryBySpecialty: 'GET /query/salons?specialty=facials',
            queryByCity: 'GET /query/salons?city=New York',
            formulationsByType: 'GET /formulations?type=serum',
            formulationsBySkinType: 'GET /formulations?skinType=dry',
            proceduresBySkinType: 'GET /procedures?skinType=sensitive',
            proceduresByDuration: 'GET /procedures?minDuration=60&maxDuration=90',
          }
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get all salons
      if (path === '/salons') {
        const salons = env.skintwind.getAllSalons();
        return new Response(JSON.stringify(salons, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get all labs
      if (path === '/labs') {
        const labs = env.skintwind.getLabs();
        return new Response(JSON.stringify(labs, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get specific salon
      const salonMatch = path.match(/^\/salon\/([^\/]+)$/);
      if (salonMatch) {
        const salonId = salonMatch[1];
        const salon = env.skintwind.getSalon(salonId);
        return new Response(JSON.stringify(salon, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get procedures for salon
      const salonProcMatch = path.match(/^\/salon\/([^\/]+)\/procedures$/);
      if (salonProcMatch) {
        const salonId = salonProcMatch[1];
        const procedures = env.skintwind.getSalonProcedures(salonId);
        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get specific procedure with cost
      const procMatch = path.match(/^\/procedure\/([^\/]+)$/);
      if (procMatch) {
        const procedureId = procMatch[1];
        const procedure = env.skintwind.getProcedure(procedureId);
        const cost = env.skintwind.calculateProcedureCost(procedureId);
        return new Response(JSON.stringify({ 
          ...procedure, 
          calculatedCost: cost 
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Query procedures
      if (path === '/procedures') {
        const query = {};
        if (url.searchParams.has('salonId')) query.salonId = url.searchParams.get('salonId');
        if (url.searchParams.has('skinType')) query.skinType = url.searchParams.get('skinType');
        if (url.searchParams.has('minDuration')) query.minDuration = parseInt(url.searchParams.get('minDuration'));
        if (url.searchParams.has('maxDuration')) query.maxDuration = parseInt(url.searchParams.get('maxDuration'));
        if (url.searchParams.has('maxPrice')) query.maxPrice = parseFloat(url.searchParams.get('maxPrice'));
        
        const procedures = env.skintwind.queryProcedures(query);
        return new Response(JSON.stringify(procedures, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get specific formulation
      const formMatch = path.match(/^\/formulation\/([^\/]+)$/);
      if (formMatch) {
        const formulationId = formMatch[1];
        const formulation = env.skintwind.getFormulation(formulationId);
        return new Response(JSON.stringify(formulation, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Query formulations
      if (path === '/formulations') {
        const query = {};
        if (url.searchParams.has('type')) query.type = url.searchParams.get('type');
        if (url.searchParams.has('skinType')) query.skinType = url.searchParams.get('skinType');
        if (url.searchParams.has('benefit')) query.benefit = url.searchParams.get('benefit');
        if (url.searchParams.has('maxPrice')) query.maxPrice = parseFloat(url.searchParams.get('maxPrice'));
        if (url.searchParams.has('certification')) query.certification = url.searchParams.get('certification');
        
        const formulations = env.skintwind.queryFormulations(query);
        return new Response(JSON.stringify(formulations, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Query salons
      if (path === '/query/salons') {
        const query = {};
        if (url.searchParams.has('specialty')) query.specialty = url.searchParams.get('specialty');
        if (url.searchParams.has('city')) query.city = url.searchParams.get('city');
        if (url.searchParams.has('cooperativeId')) query.cooperativeId = url.searchParams.get('cooperativeId');
        if (url.searchParams.has('certification')) query.certification = url.searchParams.get('certification');
        
        const salons = env.skintwind.querySalons(query);
        return new Response(JSON.stringify(salons, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 404 - Not Found
      return new Response('Not Found', { status: 404 });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }, null, 2), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
