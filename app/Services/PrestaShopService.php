<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class PrestaShopService
{
    /**
     * Test the connection to a PrestaShop store.
     */
    public function testConnection(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }
        $endpoint = $baseUrl . '/?io_format=JSON&ws_key=' . $apiKey;

        try {
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Connection successful!',
                    'data' => $response->json(),
                ];
            }
            return [
                'success' => false,
                'message' => 'Connection failed: ' . $response->status() . ' ' . $response->body(),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get all orders for a specific customer.
     */
    public function getCustomerOrders(string $url, string $apiKey, int $customerId): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/orders?io_format=JSON&display=full&filter[id_customer]=' . $customerId . '&sort=[id_DESC]&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                return $response->json()['orders'] ?? [];
            }
            return [];
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get standard budgets for all customers from walletmodule.
     */
    public function getCustomerBudgets(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            // Uses the new resource 'customer_budgets' exposed by walletmodule
            $endpoint = $baseUrl . '/customer_budgets?io_format=JSON&display=full&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            
            if ($response->successful()) {
                return $response->json()['customer_budgets'] ?? [];
            }
            return [];
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get standard budget for a specific customer from walletmodule.
     */
    public function getCustomerBudget(string $url, string $apiKey, int $customerId): ?array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/customer_budgets?io_format=JSON&display=full&filter[id_customer]=' . $customerId . '&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            
            if ($response->successful()) {
                $budgets = $response->json()['customer_budgets'] ?? [];
                return !empty($budgets) ? $budgets[0] : null;
            }
            return null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Update customer budget in walletmodule via WebService.
     */
    public function updateCustomerBudget(string $url, string $apiKey, int $customerId, array $data): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            // 1. Find the current budget ID for this customer
            $budget = $this->getCustomerBudget($url, $apiKey, $customerId);
            
            if (!$budget) {
                // If no budget entry exists, we might need to POST (create) it
                $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<prestashop xmlns:xlink=\"http://www.w3.org/1999/xlink\">
    <customer_budget>
        <id_customer><![CDATA[{$customerId}]]></id_customer>
        <standard_budget><![CDATA[{$data['standard_budget']}]]></standard_budget>
        <special_budget><![CDATA[{$data['special_budget']}]]></special_budget>
    </customer_budget>
</prestashop>";
                $response = Http::withoutVerifying()->withBody($xml, 'application/xml')
                    ->post($baseUrl . '/customer_budgets?ws_key=' . $apiKey);
            } else {
                // If it exists, we PUT (update) it
                $id = $budget['id'];
                $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<prestashop xmlns:xlink=\"http://www.w3.org/1999/xlink\">
    <customer_budget>
        <id><![CDATA[{$id}]]></id>
        <id_customer><![CDATA[{$customerId}]]></id_customer>
        <standard_budget><![CDATA[{$data['standard_budget']}]]></standard_budget>
        <special_budget><![CDATA[{$data['special_budget']}]]></special_budget>
    </customer_budget>
</prestashop>";
                $response = Http::withoutVerifying()->withBody($xml, 'application/xml')
                    ->put($baseUrl . '/customer_budgets/' . $id . '?ws_key=' . $apiKey);
            }

            return $response->successful();
        } catch (Exception $e) {
            \Log::error("Failed to update customer budget: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get wallet transactions from walletmodule.
     */
    public function getWalletTransactions(string $url, string $apiKey, int $page = 1, int $limit = 10, array $filters = [], string $sortField = 'id', string $sortOrder = 'DESC'): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $offset = ($page - 1) * $limit;
            $endpoint = $baseUrl . '/wallet_transactions?io_format=JSON&display=full&sort=[' . $sortField . '_' . $sortOrder . ']&limit=' . $offset . ',' . $limit . '&ws_key=' . $apiKey;

            if (!empty($filters)) {
                foreach ($filters as $key => $value) {
                    if ($value !== null && $value !== '') {
                        $endpoint .= '&filter[' . $key . ']=%[' . $value . ']%';
                    }
                }
            }

            $response = Http::withoutVerifying()->get($endpoint);
            
            if ($response->successful()) {
                $data = $response->json();
                $items = $data['wallet_transactions'] ?? [];
                
                // Get total count for pagination (requires a separate call to the resource without limit)
                $countEndpoint = $baseUrl . '/wallet_transactions?io_format=JSON&display=[id]&ws_key=' . $apiKey;
                if (!empty($filters)) {
                    foreach ($filters as $key => $value) {
                        if ($value !== null && $value !== '') {
                            $countEndpoint .= '&filter[' . $key . ']=%[' . $value . ']%';
                        }
                    }
                }
                $countResponse = Http::withoutVerifying()->get($countEndpoint);
                $total = 0;
                if ($countResponse->successful()) {
                    $totalData = $countResponse->json();
                    $total = isset($totalData['wallet_transactions']) ? count($totalData['wallet_transactions']) : 0;
                }

                return [
                    'items' => $items,
                    'total' => $total
                ];
            }
            return ['items' => [], 'total' => 0];
        } catch (Exception $e) {
            return ['items' => [], 'total' => 0];
        }
    }

    /**
     * Get statistics from PrestaShop (Counts of products, orders, customers).
     */
    public function getStats(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        $resources = ['products', 'orders', 'customers'];
        $stats = [];

        foreach ($resources as $resource) {
            try {
                $endpoint = $baseUrl . '/' . $resource . '?io_format=JSON&display=[id]&ws_key=' . $apiKey;
                $response = Http::withoutVerifying()->get($endpoint);
                if ($response->successful()) {
                    $itemData = $response->json();
                    $stats[$resource . '_count'] = isset($itemData[$resource]) ? count($itemData[$resource]) : 0;
                } else {
                    $stats[$resource . '_count'] = 0;
                }
            } catch (Exception $e) {
                $stats[$resource . '_count'] = 0;
            }
        }

        return $stats;
    }

    /**
     * Get sales performance data for charts (last X days).
     */
    public function getSalesPerformance(string $url, string $apiKey, int $days = 30): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        $fromDate = date('Y-m-d 00:00:00', strtotime("-$days days"));

        try {
            // Fetch last 1000 orders. 
            // We use sorting by ID instead of date_add because of Error 38 (Filter not exist) 
            // which happens on some PS configurations where date_add is not sortable/filterable via API.
            $urlParams = [
                'io_format' => 'JSON',
                'display' => '[date_add,total_paid]',
                'sort' => '[id_DESC]',
                'limit' => '1000',
                'ws_key' => $apiKey,
            ];

            $endpoint = $baseUrl . '/orders?' . http_build_query($urlParams);
            $response = Http::withoutVerifying()->get($endpoint);

            if ($response->successful()) {

                $items = $response->json()['orders'] ?? [];

                // Process data to group by day
                $dailySales = [];
                for ($i = $days; $i >= 0; $i--) {
                    $d = date('Y-m-d', strtotime("-$i days"));
                    $dailySales[$d] = 0;
                }

                foreach ($items as $order) {
                    $orderDate = $order['date_add'];
                    if ($orderDate < $fromDate)
                        continue; // Manual filter for efficiency if we hit 1000 items

                    $date = date('Y-m-d', strtotime($orderDate));
                    if (isset($dailySales[$date])) {
                        $dailySales[$date] += (float) $order['total_paid'];
                    }
                }

                return [
                    'labels' => array_keys($dailySales),
                    'datasets' => [
                        [
                            'label' => 'Ventes (€)',
                            'backgroundColor' => 'rgba(79, 70, 229, 0.1)',
                            'borderColor' => '#4f46e5',
                            'pointBackgroundColor' => '#4f46e5',
                            'data' => array_values($dailySales),
                            'fill' => true,
                            'tension' => 0.4
                        ]
                    ]
                ];
            }
        } catch (Exception $e) {
            // Fallback empty data
        }

        return ['labels' => [], 'datasets' => []];
    }



    /**
     * Get products list from PrestaShop with pagination and multi-filters.
     */
    public function getProducts(string $url, string $apiKey, int $page = 1, int $limit = 10, ?array $filters = [], string $sortField = 'id', string $sortOrder = 'DESC'): array
    {
        $results = $this->getResourceList($url, $apiKey, 'products', $page, $limit, $filters, $sortField, $sortOrder);

        $results['items'] = array_map(function ($item) use ($url, $apiKey) {
            return $this->attachImageUrl($item, $url, $apiKey);
        }, $results['items']);

        return $results;
    }

    /**
     * Get orders list from PrestaShop with pagination and multi-filters.
     */
    public function getOrders(string $url, string $apiKey, int $page = 1, int $limit = 10, ?array $filters = [], string $sortField = 'id', string $sortOrder = 'DESC'): array
    {
        return $this->getResourceList($url, $apiKey, 'orders', $page, $limit, $filters, $sortField, $sortOrder);
    }

    /**
     * Get categories list from PrestaShop with pagination and multi-filters.
     */
    public function getCategories(string $url, string $apiKey, int $page = 1, int $limit = 10, ?array $filters = [], string $sortField = 'id', string $sortOrder = 'DESC'): array
    {
        $results = $this->getResourceList($url, $apiKey, 'categories', $page, $limit, $filters, $sortField, $sortOrder);

        $results['items'] = array_map(function ($item) use ($url, $apiKey) {
            return $this->attachCategoryImage($item, $url, $apiKey);
        }, $results['items']);

        return $results;
    }

    /**
     * Helper to attach image URL to category data.
     */
    private function attachCategoryImage(array $category, string $url, string $apiKey): array
    {
        if (isset($category['id'])) {
            $baseUrl = rtrim($url, '/');
            $category['image_url'] = $baseUrl . "/api/images/categories/" . $category['id'] . "?ws_key=" . $apiKey;
        } else {
            $category['image_url'] = null;
        }
        return $category;
    }

    /**
     * Get customers list from PrestaShop with pagination and multi-filters.
     */
    public function getCustomers(string $url, string $apiKey, int $page = 1, int $limit = 10, ?array $filters = [], string $sortField = 'id', string $sortOrder = 'DESC'): array
    {
        return $this->getResourceList($url, $apiKey, 'customers', $page, $limit, $filters, $sortField, $sortOrder);
    }

    /**
     * Get a single product from PrestaShop.
     */
    public function getProduct(string $url, string $apiKey, int $id): array
    {
        $product = $this->getResourceDetails($url, $apiKey, 'products', $id);
        return $this->attachImageUrl($product, $url, $apiKey);
    }

    /**
     * Create a product in a target PrestaShop shop (used for cross-shop copy).
     */
    public function createProduct(string $targetUrl, string $targetApiKey, array $sourceProduct): array
    {
        $targetApiKey = trim($targetApiKey);
        $baseUrl = rtrim($targetUrl, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        $getMultiLang = function ($field) use ($sourceProduct): string {
            $val = $sourceProduct[$field] ?? '';
            if (is_string($val))
                return htmlspecialchars($val);
            if (is_array($val) && isset($val[0])) {
                $item = $val[0];
                return htmlspecialchars(is_array($item) ? ($item['value'] ?? '') : (string) $item);
            }
            if (is_array($val) && isset($val['language'])) {
                $langs = is_array($val['language']) ? $val['language'] : [$val['language']];
                return htmlspecialchars($langs[0]['value'] ?? '');
            }
            return '';
        };

        $name = $getMultiLang('name');
        $desc = $getMultiLang('description');
        $descShort = $getMultiLang('description_short');
        $linkRewrite = $getMultiLang('link_rewrite') ?: strtolower(preg_replace('/[^a-z0-9]+/', '-', mb_strtolower($name)));
        $price = $sourceProduct['price'] ?? '0.000000';
        $reference = $sourceProduct['reference'] ?? '';
        $active = $sourceProduct['active'] ?? '0';
        $state = $sourceProduct['state'] ?? '1';
        $idCategoryDefault = $sourceProduct['id_category_default'] ?? '2';
        $condition = $sourceProduct['condition'] ?? 'new';
        $visibility = $sourceProduct['visibility'] ?? 'both';

        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
<product>
    <price><![CDATA[{$price}]]></price>
    <reference><![CDATA[{$reference}]]></reference>
    <active><![CDATA[{$active}]]></active>
    <state><![CDATA[{$state}]]></state>
    <id_category_default><![CDATA[{$idCategoryDefault}]]></id_category_default>
    <condition><![CDATA[{$condition}]]></condition>
    <visibility><![CDATA[{$visibility}]]></visibility>
    <name>
        <language id="1"><![CDATA[{$name}]]></language>
    </name>
    <description>
        <language id="1"><![CDATA[{$desc}]]></language>
    </description>
    <description_short>
        <language id="1"><![CDATA[{$descShort}]]></language>
    </description_short>
    <link_rewrite>
        <language id="1"><![CDATA[{$linkRewrite}]]></language>
    </link_rewrite>
</product>
</prestashop>
XML;

        try {
            $endpoint = $baseUrl . '/products?ws_key=' . $targetApiKey;
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->withBody($xml, 'application/xml')
                ->post($endpoint);

            if ($response->successful()) {
                $resXml = new \SimpleXMLElement($response->body());
                $newId = (int) $resXml->product->id;
                return ['success' => true, 'new_id' => $newId];
            }

            \Log::error('PS createProduct failed: ' . $response->body());
            return ['success' => false, 'error' => 'API error: ' . $response->status()];
        } catch (\Exception $e) {
            \Log::error('PS createProduct exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get modules list from PrestaShop.
     */
    public function getModules(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/modules?io_format=JSON&display=full&filter[active]=1&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);

            if ($response->successful()) {
                $body = $response->body();
                // Check if response is XML (PrestaShop sometimes ignores io_format=JSON for modules)
                if (str_contains($body, '<?xml') || str_contains($body, '<prestashop')) {
                    $xml = new \SimpleXMLElement($body);
                    $modules = [];
                    foreach ($xml->modules->module as $moduleNode) {
                        $modules[] = [
                            'id' => (string) $moduleNode->id,
                            'name' => (string) $moduleNode->name,
                            'active' => (string) $moduleNode->active,
                            'version' => (string) $moduleNode->version,
                            'displayName' => (string) $moduleNode->displayName,
                            'description' => (string) $moduleNode->description,
                            'author' => (string) $moduleNode->author,
                        ];
                    }
                    return $modules;
                }

                return $response->json()['modules'] ?? [];
            }
            return [];
        } catch (Exception $e) {
            \Log::error("PS getModules error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Upload an image to a product from a given URL.
     */
    public function uploadProductImage(string $url, string $apiKey, int $productId, string $imageUrl): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            // 1. Download the image
            $imageResponse = Http::withoutVerifying()->get($imageUrl);
            if (!$imageResponse->successful()) {
                return ['success' => false, 'error' => 'Could not download image from ' . $imageUrl];
            }

            $imageContent = $imageResponse->body();
            $mimeType = $imageResponse->header('Content-Type') ?: 'image/jpeg';
            $extension = 'jpg';
            if (str_contains($mimeType, 'png'))
                $extension = 'png';
            if (str_contains($mimeType, 'webp'))
                $extension = 'webp';

            // 2. Upload to PrestaShop
            $endpoint = $baseUrl . '/images/products/' . $productId . '?ws_key=' . $apiKey;

            $response = Http::withoutVerifying()
                ->attach('image', $imageContent, 'product_image.' . $extension)
                ->post($endpoint);

            if ($response->successful()) {
                return ['success' => true];
            }

            \Log::error('PS uploadProductImage failed: ' . $response->body());
            return ['success' => false, 'error' => 'API error: ' . $response->status()];
        } catch (Exception $e) {
            \Log::error('PS uploadProductImage exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get KS1 related configuration settings from PrestaShop.
     */
    public function getKs1Settings(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            // Explicit list of keys to fetch to avoid unreliable wildcard support
            $keys = [
                'psks1_ks1_id',
                'psks1_user',
                'psks1_password',
                'psks1_salesman',
                'psks1_shop_identifier',
                'psks1_shipping_cost_id',
                'psks1_conditions',
                'psks1_conditions_days',
                'psks1_discount',
                'psks1_discount_days',
                'psks1_order_states',
                'psks1_project',
                'psks1_delivery_date',
                'psks1_weight_per_package'
            ];
            $filter = '[' . implode('|', $keys) . ']';

            $endpoint = $baseUrl . '/configurations?io_format=JSON&display=full&filter[name]=' . $filter . '&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                $body = $response->body();
                $configs = [];

                // Handle XML response if JSON was ignored by PrestaShop
                if (str_contains($body, '<?xml') || str_contains($body, '<prestashop')) {
                    $xml = new \SimpleXMLElement($body);
                    if (isset($xml->configurations->configuration)) {
                        foreach ($xml->configurations->configuration as $configNode) {
                            $configData = [];
                            if (isset($configNode->name) && isset($configNode->value)) {
                                $configData = [
                                    'name' => (string) $configNode->name,
                                    'value' => (string) $configNode->value,
                                ];
                            } else {
                                // Fallback: if only ID is returned, fetch details
                                $id = (int) $configNode['id'];
                                $configData = $this->getResourceDetails($url, $apiKey, 'configurations', $id);
                            }
                            if ($configData)
                                $configs[] = $configData;
                        }
                    }
                } else {
                    $data = $response->json();
                    $rawConfigs = $data['configurations'] ?? [];

                    foreach ($rawConfigs as $item) {
                        if (isset($item['name']) && isset($item['value'])) {
                            $configs[] = $item;
                        } elseif (isset($item['id'])) {
                            // Fallback: if only ID is returned, fetch details
                            $configData = $this->getResourceDetails($url, $apiKey, 'configurations', (int) $item['id']);
                            if ($configData)
                                $configs[] = $configData;
                        }
                    }
                }

                if (empty($configs)) {
                    return [];
                }

                $rawSettings = [];
                foreach ($configs as $config) {
                    $rawSettings[$config['name']] = $config['value'];
                }

                // Map to frontend expected keys
                $mapped = [
                    'ks1_id' => $rawSettings['psks1_ks1_id'] ?? '',
                    'ks1_user' => $rawSettings['psks1_user'] ?? '',
                    'ks1_pass' => $rawSettings['psks1_password'] ?? '',
                    'ks1_salesman' => $rawSettings['psks1_salesman'] ?? '',
                    'ks1_shop_identifier' => $rawSettings['psks1_shop_identifier'] ?? '',
                    'ks1_project' => $rawSettings['psks1_project'] ?? 'Lager',
                    'shipping_cost_id' => $rawSettings['psks1_shipping_cost_id'] ?? '9999',
                    'conditions' => $rawSettings['psks1_conditions'] ?? '14 Tage Netto',
                    'conditions_days' => (int) ($rawSettings['psks1_conditions_days'] ?? 14),
                    'discount' => (float) ($rawSettings['psks1_discount'] ?? 0),
                    'discount_days' => (int) ($rawSettings['psks1_discount_days'] ?? 0),
                    'delivery_date' => (int) ($rawSettings['psks1_delivery_date'] ?? 4),
                    'weight_per_package' => (float) ($rawSettings['psks1_weight_per_package'] ?? 15),
                ];

                // Special handling for PHP serialized order_states
                if (!empty($rawSettings['psks1_order_states'])) {
                    try {
                        // Very basic "unserialize" for simple arrays like a:1:{i:0;i:2;}
                        // Since we can't safely use native unserialize on untrusted API data without care,
                        // and it's usually just IDs, let's try to extract numbers.
                        if (preg_match_all('/i:(\d+);/', $rawSettings['psks1_order_states'], $matches)) {
                            $mapped['order_states'] = array_map('intval', $matches[1]);
                        }
                    } catch (Exception $e) {
                        $mapped['order_states'] = [2];
                    }
                }

                return $mapped;
            }
        } catch (Exception $e) {
            \Log::error("PS getKs1Settings error: " . $e->getMessage());
        }
        return [];
    }

    /**
     * Update KS1 configurations in PrestaShop.
     */
    public function updateKs1Settings(string $url, string $apiKey, array $settings): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        // Mapping: Local Key -> PrestaShop Key
        $mapping = [
            'ks1_id' => 'psks1_ks1_id',
            'ks1_user' => 'psks1_user',
            'ks1_pass' => 'psks1_password',
            'ks1_salesman' => 'psks1_salesman',
            'ks1_shop_identifier' => 'psks1_shop_identifier',
            'shipping_cost_id' => 'psks1_shipping_cost_id',
            'conditions' => 'psks1_conditions',
            'conditions_days' => 'psks1_conditions_days',
            'discount' => 'psks1_discount',
            'discount_days' => 'psks1_discount_days',
            'order_states' => 'psks1_order_states',
            'ks1_project' => 'psks1_project',
            'delivery_date' => 'psks1_delivery_date',
            'weight_per_package' => 'psks1_weight_per_package',
        ];

        foreach ($mapping as $localKey => $psKey) {
            if (!array_key_exists($localKey, $settings))
                continue;

            $value = $settings[$localKey] ?? '';

            // Case: order_states must be serialized for PrestaShop
            if ($localKey === 'order_states' && is_array($value)) {
                $serialized = "a:" . count($value) . ":{";
                foreach ($value as $i => $idVal) {
                    $serialized .= "i:$i;i:$idVal;";
                }
                $serialized .= "}";
                $value = $serialized;
            }

            try {
                // 1. Search if config exists to get ID
                $searchRes = Http::withoutVerifying()->get($baseUrl . "/configurations", [
                    'io_format' => 'JSON',
                    'display' => '[id]',
                    'filter[name]' => $psKey,
                    'ws_key' => $apiKey
                ]);

                if (!$searchRes->successful()) {
                    continue;
                }

                $configs = $searchRes->json()['configurations'] ?? [];

                foreach ($configs as $config) {
                    $id = $config['id'];
                    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
                            <prestashop xmlns:xlink=\"http://www.w3.org/1999/xlink\">
                                <configuration>
                                    <id><![CDATA[{$id}]]></id>
                                    <name><![CDATA[{$psKey}]]></name>
                                    <value><![CDATA[{$value}]]></value>
                                </configuration>
                            </prestashop>";

                    $putRes = Http::withoutVerifying()->withBody($xml, 'application/xml')
                        ->put($baseUrl . "/configurations/{$id}?ws_key={$apiKey}");

                    if (!$putRes->successful()) {
                        \Log::error("PS Update PUT Failed for $psKey (ID $id): " . $putRes->status() . " - " . $putRes->body());
                    }
                }

                if (empty($configs)) {
                    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
                            <prestashop xmlns:xlink=\"http://www.w3.org/1999/xlink\">
                                <configuration>
                                    <name><![CDATA[{$psKey}]]></name>
                                    <value><![CDATA[{$value}]]></value>
                                </configuration>
                            </prestashop>";

                    $postRes = Http::withoutVerifying()->withBody($xml, 'application/xml')
                        ->post($baseUrl . "/configurations?ws_key={$apiKey}");

                    if (!$postRes->successful()) {
                        \Log::error("PS Update POST Failed for $psKey: " . $postRes->status() . " - " . $postRes->body());
                    }
                }
            } catch (\Exception $e) {
                \Log::error("Failed to sync $psKey to PrestaShop: " . $e->getMessage());
            }
        }

        return true;
    }

    /**
     * Get a single category from PrestaShop.
     */
    public function getCategory(string $url, string $apiKey, int $id): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/categories/' . $id . '?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                $rawXml = $response->body();
                \Log::info("PS Category XML Response for ID $id: " . $rawXml);
                $xml = new \SimpleXMLElement($rawXml);
                $categoryXml = $xml->category;

                // Convert essential XML fields to array
                $category = [
                    'id' => (int) $categoryXml->id,
                    'id_parent' => (string) $categoryXml->id_parent,
                    'active' => (string) $categoryXml->active,
                    'name' => [],
                    'description' => [],
                    'associations' => [
                        'groups' => [],
                        'products' => []
                    ]
                ];

                // Handle multi-lang name/description
                foreach ($categoryXml->name->language as $lang) {
                    $category['name'][] = ['id' => (string) $lang['id'], 'value' => (string) $lang];
                }
                foreach ($categoryXml->description->language as $lang) {
                    $category['description'][] = ['id' => (string) $lang['id'], 'value' => (string) $lang];
                }

                // Robust search for associations (PrestaShop varies)
                if (isset($categoryXml->associations)) {
                    foreach ($categoryXml->associations->children() as $assocName => $assocNode) {
                        // Check for groups (could be named "groups", "category_groups", etc.)
                        if (stripos((string) $assocName, 'group') !== false) {
                            foreach ($assocNode->children() as $item) {
                                if (isset($item->id)) {
                                    $category['associations']['groups'][] = ['id' => (string) $item->id];
                                }
                            }
                        }

                        // Products
                        if (stripos((string) $assocName, 'product') !== false) {
                            foreach ($assocNode->children() as $item) {
                                if (isset($item->id)) {
                                    $category['associations']['products'][] = ['id' => (string) $item->id];
                                }
                            }
                        }
                    }
                }

                return $this->attachCategoryImage($category, $url, $apiKey);
            }
        } catch (\Exception $e) {
            \Log::error("PS Get Category XML error: " . $e->getMessage());
        }

        // Fallback
        $category = $this->getResourceDetails($url, $apiKey, 'categories', $id);
        return $this->attachCategoryImage($category, $url, $apiKey);
    }

    /**
     * Update a category in PrestaShop.
     */
    public function updateCategory(string $url, string $apiKey, int $id, array $data): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/categories/' . $id . '?ws_key=' . $apiKey;

            // 1. Get current category XML
            $response = Http::withoutVerifying()->get($endpoint);
            if (!$response->successful())
                return false;

            $xml = new \SimpleXMLElement($response->body());
            $category = $xml->category;

            // Update fields
            if (isset($data['name'])) {
                foreach ($category->name->language as $lang) {
                    $lang[0] = $data['name'];
                }
            }
            if (isset($data['description'])) {
                foreach ($category->description->language as $lang) {
                    $lang[0] = $data['description'];
                }
            }
            if (isset($data['active'])) {
                $category->active = $data['active'] ? '1' : '0';
            }
            if (isset($data['id_parent'])) {
                $category->id_parent = (int) $data['id_parent'];
            }

            // Handle Group Access ONLY if provided in data
            if (isset($data['groups']) && is_array($data['groups'])) {
                // Remove existing groups node to avoid duplicates and ensure a clean rewrite
                if ($category->associations && $category->associations->groups) {
                    $node = dom_import_simplexml($category->associations->groups);
                    $node->parentNode->removeChild($node);
                }

                // Add new groups
                if (!$category->associations) {
                    $category->addChild('associations');
                }

                $groupsNode = $category->associations->addChild('groups');
                foreach ($data['groups'] as $groupId) {
                    $group = $groupsNode->addChild('group');
                    $group->addChild('id', (string) $groupId);
                }
            }

            // Clean read-only
            unset($category->date_add);
            unset($category->date_upd);
            unset($category->level_depth);
            unset($category->nb_products_recursive);

            $xmlContent = $xml->asXML();
            $putResponse = Http::withoutVerifying()
                ->withBody($xmlContent, 'application/xml')
                ->put($endpoint);

            return $putResponse->successful();
        } catch (\Throwable $e) {
            \Log::error("PS Update Category Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Helper to attach image URL to product data.
     */
    private function attachImageUrl(array $product, string $url, string $apiKey): array
    {
        if (isset($product['id']) && isset($product['id_default_image']) && $product['id_default_image'] != "") {
            $baseUrl = rtrim($url, '/');
            $product['main_image'] = $baseUrl . "/api/images/products/" . $product['id'] . "/" . $product['id_default_image'] . "?ws_key=" . $apiKey;
        } else {
            $product['main_image'] = null;
        }
        return $product;
    }

    /**
     * Get a single order from PrestaShop.
     */
    public function getOrder(string $url, string $apiKey, int $id): array
    {
        return $this->getResourceDetails($url, $apiKey, 'orders', $id);
    }

    /**
     * Get all order states from PrestaShop.
     */
    public function getOrderStates(string $url, string $apiKey): array
    {
        // Simple fetch all without search/pagination logic for now
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/order_states?io_format=JSON&display=full&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                return $response->json()['order_states'] ?? [];
            }
            return [];
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get all customer groups from PrestaShop.
     */
    public function getGroups(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/groups?io_format=JSON&display=full&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                return $response->json()['groups'] ?? [];
            }
            return [];
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get all addresses for a specific customer.
     */
    public function getCustomerAddresses(string $url, string $apiKey, int $customerId): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            // PS address filter: ?filter[id_customer]=ID
            $endpoint = $baseUrl . '/addresses?io_format=JSON&display=full&filter[id_customer]=' . $customerId . '&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                return $response->json()['addresses'] ?? [];
            }
            return [];
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get a single address from PrestaShop.
     */
    public function getAddress(string $url, string $apiKey, int $id): array
    {
        return $this->getResourceDetails($url, $apiKey, 'addresses', $id);
    }

    /**
     * Get all addresses from PrestaShop.
     */
    public function getAddresses(string $url, string $apiKey, int $page = 1, int $limit = 10, array $filters = [], string $sortField = 'id', string $sortOrder = 'DESC'): array
    {
        return $this->getResourceList($url, $apiKey, 'addresses', $page, $limit, $filters, $sortField, $sortOrder);
    }

    /**
     * Delete an address in PrestaShop.
     */
    public function deleteAddress(string $url, string $apiKey, int $id): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/addresses/' . $id . '?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->delete($endpoint);

            if (!$response->successful()) {
                \Log::error("PS Delete Address Failed: " . $response->status() . " - " . $response->body());
            }

            return $response->successful();
        } catch (\Throwable $e) {
            \Log::error("PS Delete Address Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update an address in PrestaShop.
     */
    public function updateAddress(string $url, string $apiKey, int $id, array $data): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/addresses/' . $id . '?ws_key=' . $apiKey;

            \Log::info("PS Update Address Starting for ID: " . $id);

            // 1. Get current XML
            $response = Http::withoutVerifying()->get($endpoint);
            if (!$response->successful()) {
                \Log::error("PS Update Address GET Failed: " . $response->status() . " - " . $response->body());
                return ['success' => false, 'message' => "Impossible de récupérer l'adresse actuelle depuis PrestaShop (Code: {$response->status()})"];
            }

            $xmlBody = $response->body();
            \Log::info("PS Update Address RECEIVED XML: " . $xmlBody);

            $xml = simplexml_load_string($xmlBody);
            if (!$xml || !isset($xml->address)) {
                \Log::error("PS Update Address: Invalid XML response or missing address tag");
                return ['success' => false, 'message' => "Réponse XML invalide de PrestaShop (élément 'address' manquant)"];
            }

            $address = $xml->address;

            // Strip xlink attributes from all children to avoid inconsistencies
            foreach ($address->children() as $child) {
                $attributes = $child->attributes('http://www.w3.org/1999/xlink');
                if (isset($attributes['href'])) {
                    unset($attributes['href']);
                }
            }

            // 2. Update fields
            $fields = [
                'id_customer',
                'id_country',
                'id_state',
                'alias',
                'company',
                'lastname',
                'firstname',
                'address1',
                'address2',
                'postcode',
                'city',
                'other',
                'phone',
                'phone_mobile',
                'vat_number',
                'dni'
            ];

            foreach ($fields as $field) {
                if (isset($data[$field])) {
                    // Correct way to update SimpleXML node text dynamically
                    $address->{$field}[0] = (string) $data[$field];
                }
            }

            // Remove read-only fields
            unset($address->date_add);
            unset($address->date_upd);

            $xmlContent = $xml->asXML();
            \Log::info("PS Update Address Sending XML: " . $xmlContent);

            // 3. Put XML
            try {
                $response = Http::withoutVerifying()->withBody($xml->asXML(), 'application/xml')->put($endpoint);

                if ($response->successful()) {
                    return ['success' => true];
                }

                // HACK for bestkit_checkoutfields module 500 error
                if ($response->status() === 500 && str_contains($response->body(), 'bestkit_checkoutfields')) {
                    \Log::warning("PS Update Address: Ignored 500 error from bestkit_checkoutfields module for ID: $id. The update should have been applied.");
                    return ['success' => true];
                }

                $errorMessage = "Erreur API PrestaShop ({$response->status()})";
                $body = $response->body();
                if (str_contains($body, '<error>')) {
                    try {
                        $errXml = new \SimpleXMLElement($body);
                        if (isset($errXml->errors->error->message)) {
                            $errorMessage = (string) $errXml->errors->error->message;
                        }
                    } catch (\Exception $e) {
                    }
                }

                \Log::error("PS Update Address PUT Failed: {$response->status()} - " . $body);
                return ['success' => false, 'message' => $errorMessage];
            } catch (\Exception $e) {
                \Log::error("PS Update Address exception: " . $e->getMessage());
                return ['success' => false, 'message' => $e->getMessage()];
            }
        } catch (\Throwable $e) {
            \Log::error("PS Update Address Exception: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Get a single carrier from PrestaShop.
     */
    public function getCarrier(string $url, string $apiKey, int $id): array
    {
        return $this->getResourceDetails($url, $apiKey, 'carriers', $id);
    }

    public function getId(string $url, string $apiKey): ?int
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/shop?io_format=JSON&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                $data = $response->json();
                return $data['shops'][0]['id'] ?? null;
            }
        } catch (\Exception $e) {
        }
        return null;
    }

    /**
     * Get all active carriers from PrestaShop.
     */
    public function getCarriers(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/carriers?io_format=JSON&display=full&filter[active]=1&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                return $response->json()['carriers'] ?? [];
            }
        } catch (Exception $e) {
            \Log::error("PS getCarriers error: " . $e->getMessage());
        }
        return [];
    }

    /**
     * Get all employees from PrestaShop.
     */
    public function getEmployees(string $url, string $apiKey): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/employees?io_format=JSON&display=full&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);
            if ($response->successful()) {
                return $response->json()['employees'] ?? [];
            }
        } catch (Exception $e) {
            \Log::error("PS getEmployees error: " . $e->getMessage());
        }
        return [];
    }

    /**
     * Delete an employee in PrestaShop.
     */
    public function deleteEmployee(string $url, string $apiKey, int $id): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/employees/' . $id . '?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->delete($endpoint);
            return $response->successful();
        } catch (Exception $e) {
            \Log::error("PS deleteEmployee error: " . $e->getMessage());
        }
        return false;
    }

    /**
     * Get a single employee from PrestaShop.
     */
    public function getEmployee(string $url, string $apiKey, int $id): array
    {
        return $this->getResourceDetails($url, $apiKey, 'employees', $id);
    }

    /**
     * Update an employee in PrestaShop.
     */
    public function updateEmployee(string $url, string $apiKey, int $id, array $data): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/employees/' . $id . '?ws_key=' . $apiKey;

            // 1. Get current employee XML
            $response = Http::withoutVerifying()->get($endpoint);
            if (!$response->successful())
                return false;

            $xml = simplexml_load_string($response->body());
            if (!$xml || !isset($xml->employee))
                return false;

            $employee = $xml->employee;

            // 2. Update fields
            if (isset($data['firstname']))
                $employee->firstname[0] = $data['firstname'];
            if (isset($data['lastname']))
                $employee->lastname[0] = $data['lastname'];
            if (isset($data['email']))
                $employee->email[0] = $data['email'];
            if (isset($data['active']))
                $employee->active[0] = $data['active'] ? '1' : '0';
            if (isset($data['id_profile']))
                $employee->id_profile[0] = (int) $data['id_profile'];

            // Optional: password (only update if provided)
            if (isset($data['passwd']) && !empty($data['passwd'])) {
                $employee->passwd[0] = $data['passwd'];
            }

            // Remove read-only or conflicting fields that cause validation errors
            unset($employee->last_connection_date);
            unset($employee->last_passwd_gen);
            unset($employee->stats_compare_from);
            unset($employee->stats_compare_to);
            unset($employee->stats_date_from);
            unset($employee->stats_date_to);
            unset($employee->bo_menu_narrow);

            // 3. Put XML back
            $putResponse = Http::withoutVerifying()
                ->withBody($xml->asXML(), 'application/xml')
                ->put($endpoint);

            if (!$putResponse->successful()) {
                \Log::error("PS Update Employee PUT Failed: " . $putResponse->status() . " - " . $putResponse->body());
            }

            return $putResponse->successful();
        } catch (\Throwable $e) {
            \Log::error("PS Update Employee Exception: " . $e->getMessage());
            return false;
        }
    }


    /**
     * Create a new employee in PrestaShop.
     */
    public function createEmployee(string $url, string $apiKey, array $data): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            // Fill required fields
            $xml = new \SimpleXMLElement('<prestashop xmlns:xlink="http://www.w3.org/1999/xlink"/>');
            $employee = $xml->addChild('employee');

            $fields = [
                'id_lang' => $data['id_lang'] ?? 1,
                'id_profile' => $data['id_profile'] ?? 1,
                'lastname' => $data['lastname'],
                'firstname' => $data['firstname'],
                'email' => $data['email'],
                'passwd' => $data['passwd'],
                'active' => (isset($data['active']) && $data['active']) ? '1' : '0',
            ];

            foreach ($fields as $key => $value) {
                $employee->addChild($key, (string) $value);
            }

            // Post to PrestaShop
            $endpoint = $baseUrl . '/employees?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()
                ->withBody($xml->asXML(), 'application/xml')
                ->post($endpoint);

            if ($response->successful()) {
                $resXml = new \SimpleXMLElement($response->body());
                return ['success' => true, 'id' => (int) $resXml->employee->id];
            }

            return ['success' => false, 'error' => $response->body()];
        } catch (\Throwable $e) {
            \Log::error("PS Create Employee Exception: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get a single group from PrestaShop.
     */
    public function getGroup(string $url, string $apiKey, int $id): array
    {
        return $this->getResourceDetails($url, $apiKey, 'groups', $id);
    }

    /**
     * Update a customer group in PrestaShop.
     */
    public function updateGroup(string $url, string $apiKey, int $id, array $data): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/groups/' . $id . '?ws_key=' . $apiKey;

            // 1. Get current group XML
            $response = Http::withoutVerifying()->get($endpoint);
            if (!$response->successful())
                return false;

            $xml = simplexml_load_string($response->body());
            if (!$xml || !isset($xml->group))
                return false;

            $group = $xml->group;

            // 2. Update fields
            if (isset($data['name'])) {
                // Update names for all languages in the XML
                foreach ($group->name->language as $lang) {
                    $lang[0] = $data['name'];
                }
            }
            if (isset($data['reduction'])) {
                $group->reduction[0] = (float) $data['reduction'];
            }
            if (isset($data['price_display_method'])) {
                $group->price_display_method[0] = (int) $data['price_display_method'];
            }
            if (isset($data['show_prices'])) {
                $group->show_prices[0] = (int) $data['show_prices'];
            }

            // 3. Put XML back
            $putResponse = Http::withoutVerifying()
                ->withBody($xml->asXML(), 'application/xml')
                ->put($endpoint);

            return $putResponse->successful();
        } catch (\Throwable $e) {
            \Log::error("PS Update Group Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a customer group in PrestaShop.
     */
    public function deleteGroup(string $url, string $apiKey, int $id): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/groups/' . $id . '?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->delete($endpoint);
            return $response->successful();
        } catch (\Throwable $e) {
            \Log::error("PS deleteGroup error: " . $e->getMessage());
            return false;
        }
    }

    public function getCountries(string $url, string $apiKey): array
    {
        $res = $this->getResourceList($url, $apiKey, 'countries', 1, 1000, ['active' => 1]);
        return $res['items'];
    }

    /**
     * Get a single customer from PrestaShop.
     */
    public function getCustomer(string $url, string $apiKey, int $id): array
    {
        return $this->getResourceDetails($url, $apiKey, 'customers', $id);
    }

    /**
     * Generic resource fetcher for PrestaShop API with pagination, multi-filters and sorting.
     */
    private function getResourceList(string $url, string $apiKey, string $resource, int $page, int $limit, ?array $filters = [], string $sortField = 'id', string $sortOrder = 'DESC'): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        $offset = ($page - 1) * $limit;
        $urlParams = [
            'io_format' => 'JSON',
            'display' => 'full',
            'limit' => "$offset,$limit",
            'sort' => "[{$sortField}_{$sortOrder}]",
            'ws_key' => $apiKey,
        ];

        if (!empty($filters) && is_array($filters)) {
            foreach ($filters as $field => $value) {
                if ($value !== null && $value !== '') {
                    if (is_string($value) && str_starts_with($value, '[') && str_ends_with($value, ']')) {
                        // Exact match or set of IDs already formatted [x|y]
                        $urlParams["filter[$field]"] = $value;
                    } else {
                        // Partial match
                        $urlParams["filter[$field]"] = "%[$value]%";
                    }
                }
            }
        }

        try {
            $endpoint = $baseUrl . '/' . $resource . '?' . http_build_query($urlParams);
            $response = Http::withoutVerifying()->get($endpoint);

            $countParams = [
                'io_format' => 'JSON',
                'display' => '[id]',
                'ws_key' => $apiKey,
            ];

            if (!empty($filters) && is_array($filters)) {
                foreach ($filters as $field => $value) {
                    if ($value !== null && $value !== '') {
                        if (is_string($value) && str_starts_with($value, '[') && str_ends_with($value, ']')) {
                            $countParams["filter[$field]"] = $value;
                        } else {
                            $countParams["filter[$field]"] = "%[$value]%";
                        }
                    }
                }
            }

            $countEndpoint = $baseUrl . '/' . $resource . '?' . http_build_query($countParams);
            $countResponse = Http::withoutVerifying()->get($countEndpoint);
            $total = 0;
            if ($countResponse->successful()) {
                $countData = $countResponse->json();
                $total = isset($countData[$resource]) ? count($countData[$resource]) : 0;
            }

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'items' => $data[$resource] ?? [],
                    'total' => $total,
                ];
            }
            return ['items' => [], 'total' => 0];
        } catch (Exception $e) {
            return ['items' => [], 'total' => 0];
        }
    }

    /**
     * Generic single resource fetcher for PrestaShop API.
     */
    private function getResourceDetails(string $url, string $apiKey, string $resource, int $id): array
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/' . $resource . '/' . $id . '?io_format=JSON&ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->get($endpoint);

            if ($response->successful()) {
                $data = $response->json();

                // PS irregular plural mapping
                $singularMap = [
                    'categories' => 'category',
                    'products' => 'product',
                    'orders' => 'order',
                    'customers' => 'customer'
                ];

                $singular = $singularMap[$resource] ?? substr($resource, 0, -1);

                // Flexible data extraction
                if (isset($data[$singular])) {
                    return $data[$singular];
                }

                if (isset($data[$resource])) {
                    // Sometimes it's wrapped in plural even for single item
                    return is_array($data[$resource]) && isset($data[$resource][0]) ? $data[$resource][0] : $data[$resource];
                }

                // Last ditch: if there's only one root key, return it
                if (count($data) === 1) {
                    return reset($data);
                }

                return $data;
            }
            return [];
        } catch (Exception $e) {
            return [];
        }
    }
    /**
     * Update a product in PrestaShop.
     */
    public function updateProduct(string $url, string $apiKey, int $id, array $data): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/products/' . $id . '?ws_key=' . $apiKey;

            // 1. Get the current product in XML format
            $response = Http::withoutVerifying()->get($endpoint);
            if (!$response->successful())
                return false;

            $xml = simplexml_load_string($response->body());
            $product = $xml->product;

            // Simple approach: only update fields that are provided
            if (isset($data['name'])) {
                foreach ($product->name->language as $lang) {
                    $lang[0] = $data['name'];
                }
            }

            if (isset($data['price'])) {
                $product->price = (float) $data['price'];
            }

            if (isset($data['reference'])) {
                $product->reference = (string) $data['reference'];
            }

            if (isset($data['description_short'])) {
                foreach ($product->description_short->language as $lang) {
                    // PrestaShop needs CDATA for HTML fields usually, but simplexml handles text.
                    // We might need to wrap in CDATA manually if it errors.
                    $lang[0] = $data['description_short'];
                }
            }

            if (isset($data['description'])) {
                foreach ($product->description->language as $lang) {
                    $lang[0] = $data['description'];
                }
            }

            // Remove read-only fields to avoid "read-only" errors from PS
            unset($product->manufacturer_name);
            unset($product->quantity);
            unset($product->id_shop_default);
            unset($product->date_add);
            unset($product->date_upd);

            // Handle active status if provided
            if (isset($data['active'])) {
                $product->active = $data['active'] ? '1' : '0';
            }

            // 3. Put it back as XML
            $putResponse = Http::withoutVerifying()
                ->withBody($xml->asXML(), 'application/xml')
                ->put($endpoint);

            return $putResponse->successful();

        } catch (Exception $e) {
            \Log::error("PS Update Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a product from PrestaShop.
     */
    public function deleteProduct(string $url, string $apiKey, int $id): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/products/' . $id . '?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->delete($endpoint);

            if (!$response->successful()) {
                \Log::error("PS Delete Product Failed: " . $response->status() . " - " . $response->body());
            }

            return $response->successful();
        } catch (\Throwable $e) {
            \Log::error("PS Delete Product Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update a customer in PrestaShop.
     */
    public function updateCustomer(string $url, string $apiKey, int $id, array $data): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/customers/' . $id . '?ws_key=' . $apiKey;

            \Log::info("PS Update Customer Starting for ID: " . $id);

            // 1. Get current customer XML
            $response = Http::withoutVerifying()->get($endpoint);
            if (!$response->successful()) {
                \Log::error("PS Update Customer GET Failed: " . $response->status() . " - " . $response->body());
                return false;
            }

            $xmlBody = $response->body();
            \Log::info("PS Update Customer RECEIVED XML: " . $xmlBody);

            $xml = simplexml_load_string($xmlBody);
            if (!$xml || !isset($xml->customer)) {
                \Log::error("PS Update Customer: Invalid XML response or missing customer tag");
                return false;
            }

            $customer = $xml->customer;

            // 2. Update fields
            // Using [0] = ... is the correct way to update node text in SimpleXML
            if (isset($data['firstname']))
                $customer->firstname[0] = $data['firstname'];
            if (isset($data['lastname']))
                $customer->lastname[0] = $data['lastname'];
            if (isset($data['email']))
                $customer->email[0] = $data['email'];
            if (isset($data['company']))
                $customer->company[0] = $data['company'];
            if (isset($data['active']))
                $customer->active[0] = $data['active'] ? '1' : '0';
            if (isset($data['id_gender']))
                $customer->id_gender[0] = (int) $data['id_gender'];
            if (isset($data['birthday']))
                $customer->birthday[0] = $data['birthday'] ?: '0000-00-00';
            if (isset($data['newsletter']))
                $customer->newsletter[0] = $data['newsletter'] ? '1' : '0';
            if (isset($data['id_default_group']))
                $customer->id_default_group[0] = (int) $data['id_default_group'];

            // Handle Groups associations
            if (isset($data['groups'])) {
                if (!isset($customer->associations)) {
                    $customer->addChild('associations');
                }

                // Clear existing groups
                unset($customer->associations->groups);
                $groupsNode = $customer->associations->addChild('groups');
                $groupsNode->addAttribute('nodeType', 'group');
                $groupsNode->addAttribute('api', 'groups');

                foreach ($data['groups'] as $groupId) {
                    $groupNode = $groupsNode->addChild('group');
                    $groupNode->addChild('id', (string) $groupId);
                }
            }

            // PrestaShop often requires the passwd field even if it's not being updated.
            // If it's not present or being unset, the API might return a 400 error.
            if (!isset($customer->passwd)) {
                $customer->addChild('passwd', '');
            }

            // Remove only fields that are strictly read-only and known to cause errors if modified
            unset($customer->date_add);
            unset($customer->date_upd);

            $xmlContent = $xml->asXML();
            \Log::info("PS Update Customer Sending XML: " . $xmlContent);

            // 3. Put XML
            $putResponse = Http::withoutVerifying()
                ->withBody($xmlContent, 'application/xml')
                ->put($endpoint);

            if (!$putResponse->successful()) {
                \Log::error("PS Update Customer PUT Failed: " . $putResponse->status() . " - " . $putResponse->body());
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            \Log::error("PS Update Customer Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Delete a customer from PrestaShop.
     */
    public function deleteCustomer(string $url, string $apiKey, int $id): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/customers/' . $id . '?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->delete($endpoint);

            if (!$response->successful()) {
                \Log::error("PS Delete Customer Failed: " . $response->status() . " - " . $response->body());
            }

            return $response->successful();
        } catch (\Throwable $e) {
            \Log::error("PS Delete Customer Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a category from PrestaShop.
     */
    public function deleteCategory(string $url, string $apiKey, int $id): bool
    {
        $apiKey = trim($apiKey);
        $baseUrl = rtrim($url, '/');
        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $endpoint = $baseUrl . '/categories/' . $id . '?ws_key=' . $apiKey;
            $response = Http::withoutVerifying()->delete($endpoint);

            if (!$response->successful()) {
                \Log::error("PS Delete Category Failed: " . $response->status() . " - " . $response->body());
            }

            return $response->successful();
        } catch (\Throwable $e) {
            \Log::error("PS Delete Category Exception: " . $e->getMessage());
            return false;
        }
    }
}
