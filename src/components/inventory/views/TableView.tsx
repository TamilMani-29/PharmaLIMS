@@ .. @@
 interface FilterState {
   type: string[];
-  status: string[];
   location: string[];
-  owner: string[];
+  status: string[];
+  manufacturer: string[];
+  expiryDate: string;
 }
 
 const SAMPLE_TYPES = [
-  'API Raw Material',
-  'Excipient',
-  'In-Process Material',
-  'Finished Product',
-  'Reference Standard',
-  'Stability Sample',
-  'Validation Material'
+  'Reagent',
+  'Solvent',
+  'Standard',
+  'Buffer'
  'Reagent',
  'Solvent',
  'Standard',
  'Buffer'
 ];
 
 const SAMPLE_STATUSES = [
-  'Quarantine',
-  'Quality Control',
-  'Stability Testing',
-  'Method Validation',
-  'Release Testing',
-  'Documentation Review',
-  'Released',
-  'Rejected'
+  'In Use',
+  'About to Expire',
+  'Expired',
+  'About to Deplete',
+  'Depleted',
+  'Quarantined'
 ];
 
 const LAB_LOCATIONS = [
-  'QC Lab',
-  'Analytical Lab',
-  'Stability Chamber',
-  'Method Lab',
-  'Reference Lab',
-  'Sample Storage',
-  'Quarantine Area'
+  'Lab 1',
+  'Lab 2',
+  'Lab 3',
+  'Lab 4',
+  'Lab 5'
 ];
 
-const SAMPLE_OWNERS = [
-  'Dr. Sarah Chen',
-  'Dr. Michael Rodriguez',
-  'Dr. Emily Taylor',
-  'Dr. James Wilson',
-  'Dr. Lisa Anderson'
+const MANUFACTURERS = [
+  'Sigma-Aldrich',
+  'Thermo Fisher',
+  'Merck',
+  'VWR',
+  'Bio-Rad'
@@ .. @@
   const [filters, setFilters] = useState<FilterState>({
     type: [],
-    status: [],
     location: [],
-    owner: [],
+    status: [],
+    manufacturer: [],
+    expiryDate: '',
   });
 
   const filteredData = samples.filter(row => {
     const typeMatch = filters.type.length === 0 || filters.type.includes(row.type);
     const statusMatch = filters.status.length === 0 || filters.status.includes(row.status);
     const locationMatch = filters.location.length === 0 || filters.location.includes(row.location);
-    const ownerMatch = filters.owner.length === 0 || filters.owner.includes(row.owner);
-    return typeMatch && statusMatch && locationMatch && ownerMatch;
+    const manufacturerMatch = filters.manufacturer.length === 0 || filters.manufacturer.includes(row.manufacturer);
+    const expiryMatch = !filters.expiryDate || new Date(row.dates.expiry) <= new Date(filters.expiryDate);
+    return typeMatch && statusMatch && locationMatch && manufacturerMatch && expiryMatch;
    const manufacturerMatch = filters.manufacturer.length === 0 || filters.manufacturer.includes(row.manufacturer);
    return typeMatch && statusMatch && locationMatch && manufacturerMatch;
   });
 
   const toggleFilter = (category: keyof FilterState, value: string) => {
+    if (category === 'expiryDate') {
+      setFilters(prev => ({
+        ...prev,
+        [category]: value
+      }));
+      return;
+    }
+
     setFilters(prev => ({
       ...prev,
       [category]: prev[category].includes(value)
@@ -87,8 +89,9 @@
   const clearFilters = () => {
     setFilters({
       type: [],
-      status: [],
       location: [],
-      owner: [],
+      status: [],
+      manufacturer: [],
+      expiryDate: '',
     });
   };
@@ .. @@
       {showFilters && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
-          <div className="bg-white rounded-lg shadow-xl w-[800px]">
+          <div className="bg-white rounded-lg shadow-xl w-[900px]">
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 className="text-lg font-semibold text-gray-900">Filter Samples</h2>
               <div className="flex items-center space-x-4">
@@ .. @@
             </div>
             
             <div className="p-6">
-              <div className="grid grid-cols-4 gap-8">
              <div className="grid grid-cols-4 gap-6">
+              <div className="grid grid-cols-5 gap-8">
                 {/* Sample Type Filter */}
                 <div>
                   <h3 className="text-sm font-medium text-gray-900 mb-4">Sample Type</h3>
@@ -262,7 +265,7 @@
                 </div>
 
                 {/* Status Filter */}
                 <div>
-                  <h3 className="text-sm font-medium text-gray-900 mb-4">Status</h3>
+                  <h3 className="text-sm font-medium text-gray-900 mb-4">Item Status</h3>
                   <div className="space-y-3">
                     {SAMPLE_STATUSES.map(status => (
                       <label key={status} className="flex items-center">
@@ -277,7 +280,7 @@
                 </div>
 
                 {/* Location Filter */}
                 <div>
-                  <h3 className="text-sm font-medium text-gray-900 mb-4">Lab Location</h3>
+                  <h3 className="text-sm font-medium text-gray-900 mb-4">Location</h3>
                   <div className="space-y-3">
                     {LAB_LOCATIONS.map(location => (
                       <label key={location} className="flex items-center">
@@ -291,19 +294,42 @@
                   </div>
                 </div>
 
-                {/* Owner Filter */}
+                {/* Manufacturer Filter */}
                 <div>
-                  <h3 className="text-sm font-medium text-gray-900 mb-4">Owner</h3>
+                  <h3 className="text-sm font-medium text-gray-900 mb-4">Manufacturer</h3>
                   <div className="space-y-3">
-                    {SAMPLE_OWNERS.map(owner => (
-                      <label key={owner} className="flex items-center">
+                    {MANUFACTURERS.map(manufacturer => (
+                      <label key={manufacturer} className="flex items-center">
                         <input
                           type="checkbox"
-                          checked={filters.owner.includes(owner)}
-                          onChange={() => toggleFilter('owner', owner)}
+                          checked={filters.manufacturer.includes(manufacturer)}
+                          onChange={() => toggleFilter('manufacturer', manufacturer)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
-                        <span className="ml-2 text-sm text-gray-600">{owner}</span>
+                        <span className="ml-2 text-sm text-gray-600">{manufacturer}</span>
+                      </label>
+                    ))}
+                  </div>
+                </div>
+
+                {/* Expiry Date Filter */}
+                <div>
+                  <h3 className="text-sm font-medium text-gray-900 mb-4">Expiry Date</h3>
+                  <div className="space-y-3">
+                    <label className="flex items-center">
+                      <input
+                        type="date"
+                        value={filters.expiryDate}
+                        onChange={(e) => toggleFilter('expiryDate', e.target.value)}
+                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
+                      />
+                    </label>
+                    <p className="text-xs text-gray-500">
+                      Show items expiring before this date
+                    </p>
+                    <button
+                      onClick={() => toggleFilter('expiryDate', '')}
+                      className="text-xs text-blue-600 hover:text-blue-700">
+                      Clear date
                     </label>
                   </div>
                 </div>