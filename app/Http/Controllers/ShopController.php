<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Services\PrestaShopService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    protected $service;

    public function __construct(PrestaShopService $service)
    {
        $this->service = $service;
    }


    public function index(Request $request)
    {
        $filters = $request->input('filters', []);
        $query = Shop::with('category');

        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }
        if (!empty($filters['url'])) {
            $query->where('url', 'like', '%' . $filters['url'] . '%');
        }

        return Inertia::render('Shops/Index', [
            'shops' => $query->get(),
            'params' => ['filters' => $filters]
        ]);
    }

    public function create()
    {
        return Inertia::render('Shops/Create', [
            'categories' => \App\Models\Category::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url',
            'admin_url' => 'required|url',
            'api_key' => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/shops/logos'), $filename);
            $validated['logo'] = 'uploads/shops/logos/' . $filename;
        }

        Shop::create($validated);

        return redirect()->route('shops.index')->with('success', 'Boutique ajoutée avec succès.');
    }

    public function edit(Shop $shop)
    {
        return Inertia::render('Shops/Edit', [
            'shop' => $shop,
            'categories' => \App\Models\Category::all()
        ]);
    }

    public function update(Request $request, Shop $shop)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url',
            'admin_url' => 'required|url',
            'api_key' => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($shop->logo && file_exists(public_path($shop->logo))) {
                unlink(public_path($shop->logo));
            }
            $file = $request->file('logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/shops/logos'), $filename);
            $validated['logo'] = 'uploads/shops/logos/' . $filename;
        }

        $shop->update($validated);

        return redirect()->route('shops.index')->with('success', 'Boutique mise à jour avec succès.');
    }

    public function destroy(Shop $shop)
    {
        if ($shop->logo && file_exists(public_path($shop->logo))) {
            unlink(public_path($shop->logo));
        }
        $shop->delete();
        return redirect()->route('shops.index')->with('success', 'Boutique supprimée avec succès.');
    }

    public function show(Request $request, Shop $shop)
    {
        $days = (int) $request->input('days', 30);
        $stats = [];
        $chartData = ['labels' => [], 'datasets' => []];
        $carriers = [];
        $groups = [];
        $employees = [];

        $modules = [];

        try {
            $stats = $this->service->getStats($shop->url, $shop->api_key);
            $chartData = $this->service->getSalesPerformance($shop->url, $shop->api_key, $days);
            $carriers = $this->service->getCarriers($shop->url, $shop->api_key);
            $groups = $this->service->getGroups($shop->url, $shop->api_key);
            $employees = $this->service->getEmployees($shop->url, $shop->api_key);
            $modules = $this->service->getModules($shop->url, $shop->api_key);
        } catch (\Exception $e) {
            \Log::error("Shop Show error: " . $e->getMessage());
        }

        return Inertia::render('Shops/Show', [
            'shop' => $shop,
            'stats' => $stats,
            'chart_data' => $chartData,
            'carriers' => array_slice($carriers, 0, 10),
            'customer_groups' => array_slice($groups, 0, 10),
            'employees' => $employees,
            'modules' => $modules,
            'current_days' => $days
        ]);
    }

    public function employeeDestroy(Shop $shop, int $id)
    {
        $success = $this->service->deleteEmployee($shop->url, $shop->api_key, $id);

        if ($success) {
            return back()->with('success', 'Employé supprimé avec succès de PrestaShop.');
        }

        return back()->with('error', 'Impossible de supprimer l\'employé.');
    }

    public function employeeUpdate(Request $request, Shop $shop, int $id)
    {
        $data = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'active' => 'boolean',
            'passwd' => 'nullable|string|min:8',
            'id_profile' => 'nullable|integer'
        ]);

        $success = $this->service->updateEmployee($shop->url, $shop->api_key, $id, $data);

        if ($success) {
            return back()->with('success', 'Employé mis à jour avec succès.');
        }

        return back()->with('error', 'Échec de la mise à jour de l\'employé.');
    }

    public function employeeStore(Request $request, Shop $shop)
    {
        $data = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'active' => 'boolean',
            'passwd' => 'required|string|min:8',
            'id_profile' => 'nullable|integer'
        ]);

        $result = $this->service->createEmployee($shop->url, $shop->api_key, $data);

        if ($result['success']) {
            return back()->with('success', 'Employé créé avec succès (ID #' . $result['id'] . ').');
        }

        return back()->with('error', 'Échec de la création de l\'employé : ' . ($result['error'] ?? 'Inconnu'));
    }

    public function groupUpdate(Request $request, Shop $shop, int $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'reduction' => 'nullable|numeric',
            'price_display_method' => 'nullable|integer',
            'show_prices' => 'nullable|integer'
        ]);

        $success = $this->service->updateGroup($shop->url, $shop->api_key, $id, $data);

        if ($success) {
            return back()->with('success', 'Groupe mis à jour avec succès.');
        }

        return back()->with('error', 'Échec de la mise à jour du groupe.');
    }

    public function groupDestroy(Shop $shop, int $id)
    {
        $success = $this->service->deleteGroup($shop->url, $shop->api_key, $id);

        if ($success) {
            return back()->with('success', 'Groupe supprimé avec succès.');
        }

        return back()->with('error', 'Échec de la suppression du groupe.');
    }

    public function products(Request $request, Shop $shop)
    {
        $tab = $request->input('tab', 'list');
        $page = max(1, (int) $request->input('page', 1));
        $filters = $request->input('filters', []);
        $sortField = $request->input('sort_field', 'id');
        $sortOrder = $request->input('sort_order', 'DESC');
        $limit = (int) $request->input('limit', 10);

        if ($tab === 'categories') {
            $results = $this->service->getCategories($shop->url, $shop->api_key, $page, $limit, $filters, $sortField, $sortOrder);
            $itemsKey = 'categories';
        } else {
            $results = $this->service->getProducts($shop->url, $shop->api_key, $page, $limit, $filters, $sortField, $sortOrder);
            $itemsKey = 'products';
        }

        return Inertia::render('Shops/Products', [
            'shop' => $shop,
            $itemsKey => $results['items'],
            'total' => $results['total'],
            'activeTab' => $tab,
            'params' => array_merge($request->only(['page', 'sort_field', 'sort_order', 'limit']), ['filters' => $filters, 'tab' => $tab])
        ]);
    }

    public function categoryShow(Shop $shop, int $id)
    {
        $category = $this->service->getCategory($shop->url, $shop->api_key, $id);

        return Inertia::render('Shops/CategoryShow', [
            'shop' => $shop,
            'category' => $category
        ]);
    }

    public function categoryEdit(Shop $shop, int $id)
    {
        $category = $this->service->getCategory($shop->url, $shop->api_key, $id);

        // Fetch all categories for the parent selection (limit to 1000 for practicality)
        $res = $this->service->getCategories($shop->url, $shop->api_key, 1, 1000);
        $categories = $res['items'] ?? [];

        return Inertia::render('Shops/CategoryEdit', [
            'shop' => $shop,
            'category' => $category,
            'categories' => $categories
        ]);
    }

    public function categoryUpdate(Request $request, Shop $shop, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $success = $this->service->updateCategory($shop->url, $shop->api_key, $id, $validated);

        if ($success) {
            return redirect()->route('shops.products', [$shop->id, 'tab' => 'categories'])->with('success', 'Catégorie mise à jour avec succès.');
        }

        return redirect()->back()->with('error', 'Erreur lors de la mise à jour de la catégorie dans PrestaShop.');
    }

    public function productShow(Shop $shop, int $id)
    {
        $product = $this->service->getProduct($shop->url, $shop->api_key, $id);

        // Fetch category names
        $categories = [];
        if (isset($product['associations']['categories'])) {
            foreach ($product['associations']['categories'] as $cat) {
                try {
                    $catData = $this->service->getCategory($shop->url, $shop->api_key, (int) $cat['id']);
                    if ($catData) {
                        $name = $catData['name'] ?? 'N/A';
                        if (is_array($name))
                            $name = $name[0]['value'] ?? 'N/A';
                        $categories[] = [
                            'id' => $cat['id'],
                            'name' => $name,
                            'is_default' => ($cat['id'] == $product['id_category_default'])
                        ];
                    }
                } catch (\Exception $e) {
                }
            }
        }

        // All other shops for copy feature
        $availableShops = Shop::where('id', '!=', $shop->id)->where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Shops/ProductShow', [
            'shop' => $shop,
            'product' => $product,
            'categories' => $categories,
            'availableShops' => $availableShops,
        ]);
    }

    public function productEdit(Shop $shop, int $id)
    {
        $product = $this->service->getProduct($shop->url, $shop->api_key, $id);

        return Inertia::render('Shops/ProductEdit', [
            'shop' => $shop,
            'product' => $product
        ]);
    }

    public function productUpdate(Request $request, Shop $shop, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'reference' => 'nullable|string',
            'description_short' => 'nullable|string',
            'description' => 'nullable|string',
            'active' => 'boolean'
        ]);

        $success = $this->service->updateProduct($shop->url, $shop->api_key, $id, $validated);

        if ($success) {
            return redirect()->route('shops.products.show', [$shop->id, $id])->with('success', 'Produit mis à jour avec succès.');
        }

        return redirect()->back()->with('error', 'Erreur lors de la mise à jour du produit dans PrestaShop.');
    }

    public function categoryDestroy(Shop $shop, int $id)
    {
        $success = $this->service->deleteCategory($shop->url, $shop->api_key, $id);

        if ($success) {
            return redirect()->route('shops.products', [$shop->id, 'tab' => 'categories'])->with('success', 'Catégorie supprimée de PrestaShop avec succès.');
        }

        return redirect()->back()->with('error', 'Erreur lors de la suppression de la catégorie dans PrestaShop.');
    }

    public function productDestroy(Shop $shop, int $id)
    {
        $success = $this->service->deleteProduct($shop->url, $shop->api_key, $id);

        if ($success) {
            return redirect()->route('shops.products', $shop->id)->with('success', 'Produit supprimé de PrestaShop avec succès.');
        }

        return redirect()->back()->with('error', 'Erreur lors de la suppression du produit dans PrestaShop.');
    }

    public function productCopyTo(Request $request, Shop $shop, int $id)
    {
        $validated = $request->validate([
            'target_shop_id' => 'required|integer|exists:shops,id',
        ]);

        $targetShop = Shop::findOrFail($validated['target_shop_id']);

        // Get the full product from source shop
        $product = $this->service->getProduct($shop->url, $shop->api_key, $id);

        if (empty($product)) {
            return back()->with('error', 'Impossible de récupérer le produit source.');
        }

        // Create the product in the target shop
        $result = $this->service->createProduct($targetShop->url, $targetShop->api_key, $product);

        if ($result['success']) {
            $newProductId = $result['new_id'];

            // ⚠️ NEW: Handle product image copy if source has one
            if (!empty($product['main_image'])) {
                $imageResult = $this->service->uploadProductImage(
                    $targetShop->url,
                    $targetShop->api_key,
                    $newProductId,
                    $product['main_image']
                );

                if (!$imageResult['success']) {
                    return back()->with('warning', "Le produit a été créé (ID #{$newProductId}) mais l'image n'a pas pu être copiée : " . ($imageResult['error'] ?? 'Erreur inconnue.'));
                }
            }

            return back()->with('success', "Produit copié avec succès vers \"{$targetShop->name}\" (nouveau ID: #{$newProductId}).");
        }

        return back()->with('error', 'Erreur lors de la copie : ' . ($result['error'] ?? 'Inconnu'));
    }

    public function orders(Request $request, Shop $shop)
    {
        $page = max(1, (int) $request->input('page', 1));
        $filters = $request->input('filters', []);
        $sortField = $request->input('sort_field', 'id');
        $sortOrder = $request->input('sort_order', 'DESC');
        $limit = (int) $request->input('limit', 10);

        $results = $this->service->getOrders($shop->url, $shop->api_key, $page, $limit, $filters, $sortField, $sortOrder);

        // Fetch all order states to map names
        $states = $this->service->getOrderStates($shop->url, $shop->api_key);
        $statesMap = [];
        foreach ($states as $state) {
            $name = $state['name'];
            if (is_array($name)) {
                $name = $name[0]['value'] ?? 'N/A';
            }
            $statesMap[$state['id']] = $name;
        }

        // Attach state name to orders
        $items = array_map(function ($order) use ($statesMap) {
            $order['state_name'] = $statesMap[$order['current_state']] ?? "ID: " . $order['current_state'];
            return $order;
        }, $results['items']);

        return Inertia::render('Shops/Orders', [
            'shop' => $shop,
            'orders' => $items,
            'total' => $results['total'],
            'params' => array_merge($request->only(['page', 'sort_field', 'sort_order', 'limit']), ['filters' => $filters])
        ]);
    }

    public function orderShow(Shop $shop, int $id)
    {
        $order = $this->service->getOrder($shop->url, $shop->api_key, $id);

        // Fetch the two addresses (billing + delivery)
        $addressInvoice = [];
        $addressDelivery = [];

        try {
            if (!empty($order['id_address_invoice'])) {
                $addressInvoice = $this->service->getAddress($shop->url, $shop->api_key, (int) $order['id_address_invoice']);
            }
        } catch (\Exception $e) {
        }

        try {
            if (!empty($order['id_address_delivery'])) {
                if ($order['id_address_delivery'] === $order['id_address_invoice']) {
                    $addressDelivery = $addressInvoice;
                } else {
                    $addressDelivery = $this->service->getAddress($shop->url, $shop->api_key, (int) $order['id_address_delivery']);
                }
            }
        } catch (\Exception $e) {
        }

        // Fetch carrier details
        $carrier = [];
        try {
            if (!empty($order['id_carrier'])) {
                $carrier = $this->service->getCarrier($shop->url, $shop->api_key, (int) $order['id_carrier']);
            }
        } catch (\Exception $e) {
        }

        return Inertia::render('Shops/OrderShow', [
            'shop' => $shop,
            'order' => $order,
            'address_invoice' => $addressInvoice,
            'address_delivery' => $addressDelivery,
            'carrier' => $carrier,
        ]);
    }

    public function customers(Request $request, Shop $shop)
    {
        $tab = $request->input('tab', 'list'); // 'list' or 'addresses'
        $page = max(1, (int) $request->input('page', 1));
        $filters = $request->input('filters', []);
        $sortField = $request->input('sort_field', 'id');
        $sortOrder = $request->input('sort_order', 'DESC');
        $limit = (int) $request->input('limit', 10);

        if ($tab === 'addresses') {
            $results = $this->service->getAddresses($shop->url, $shop->api_key, $page, $limit, $filters, $sortField, $sortOrder);
        } else {
            $results = $this->service->getCustomers($shop->url, $shop->api_key, $page, $limit, $filters, $sortField, $sortOrder);
        }

        return Inertia::render('Shops/Customers', [
            'shop' => $shop,
            'customers' => $tab === 'list' ? $results['items'] : [],
            'addresses' => $tab === 'addresses' ? $results['items'] : [],
            'total' => $results['total'],
            'activeTab' => $tab,
            'params' => array_merge($request->only(['page', 'sort_field', 'sort_order', 'limit', 'tab']), ['filters' => $filters])
        ]);
    }

    public function testConnection(Shop $shop)
    {
        $result = $this->service->testConnection($shop->url, $shop->api_key);

        return redirect()->back()->with('test_result', [
            'success' => $result['success'],
            'message' => $result['message'],
        ]);
    }

    public function customerShow(Shop $shop, int $id)
    {
        $customer = $this->service->getCustomer($shop->url, $shop->api_key, $id);

        $groups = [];
        $addresses = [];

        // 1. Fetch group names
        try {
            $allGroups = $this->service->getGroups($shop->url, $shop->api_key);
            $groupsMap = [];
            foreach ($allGroups as $g) {
                $name = $g['name'];
                if (is_array($name))
                    $name = $name[0]['value'] ?? 'N/A';
                $groupsMap[$g['id']] = $name;
            }

            if (isset($customer['associations']['groups'])) {
                foreach ($customer['associations']['groups'] as $groupRef) {
                    $groupId = (int) $groupRef['id'];
                    $groups[] = [
                        'id' => $groupId,
                        'name' => $groupsMap[$groupId] ?? "Groupe #$groupId",
                        'is_default' => ($groupId === (int) ($customer['id_default_group'] ?? 0))
                    ];
                }
            }
        } catch (\Exception $e) {
        }

        // 2. Fetch addresses directly by customer ID (more robust than associations)
        try {
            // PrestaShop sometimes doesn't support filtering addresses by id_customer in all versions
            // but we try it. 
            $res = $this->service->getAddresses($shop->url, $shop->api_key, 1, 50, ['id_customer' => $id]);
            $addresses = $res['items'];
        } catch (\Exception $e) {
        }

        // 3. Fetch customer orders
        $customerOrders = [];
        try {
            $orderRes = $this->service->getOrders($shop->url, $shop->api_key, 1, 10, ['id_customer' => $id]);
            $rawOrders = $orderRes['items'];

            if ($rawOrders && !is_array($rawOrders) && isset($rawOrders['id'])) {
                $rawOrders = [$rawOrders];
            }

            // Re-use $statesMap for names (I'll fetch it if not already done)
            $states = $this->service->getOrderStates($shop->url, $shop->api_key);
            $statesMap = [];
            foreach ($states as $state) {
                $name = $state['name'];
                if (is_array($name))
                    $name = $name[0]['value'] ?? 'N/A';
                $statesMap[$state['id']] = $name;
            }

            foreach ($rawOrders as $order) {
                $order['state_name'] = $statesMap[$order['current_state']] ?? "Statut #" . $order['current_state'];
                $customerOrders[] = $order;
            }
        } catch (\Exception $e) {
        }

        return Inertia::render('Shops/CustomerShow', [
            'shop' => $shop,
            'customer' => $customer,
            'groups' => $groups,
            'addresses' => $addresses,
            'orders' => $customerOrders,
        ]);
    }

    public function customerEdit(Shop $shop, int $id)
    {
        $customer = $this->service->getCustomer($shop->url, $shop->api_key, $id);
        $groups = $this->service->getGroups($shop->url, $shop->api_key);

        // Map groups to extract the name correctly (it's localized)
        $mappedGroups = array_map(function ($group) {
            $name = $group['name'] ?? 'N/A';
            if (is_array($name)) {
                $name = $name[0]['value'] ?? 'N/A';
            }
            return [
                'id' => $group['id'],
                'name' => $name
            ];
        }, $groups);

        return Inertia::render('Shops/CustomerEdit', [
            'shop' => $shop,
            'customer' => $customer,
            'groups' => $mappedGroups
        ]);
    }

    public function customerUpdate(Request $request, Shop $shop, int $id)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'active' => 'boolean',
            'id_gender' => 'nullable|integer',
            'newsletter' => 'boolean',
            'birthday' => 'nullable|date',
            'id_default_group' => 'nullable|integer',
            'groups' => 'nullable|array',
        ]);

        try {
            $success = $this->service->updateCustomer($shop->url, $shop->api_key, $id, $validated);

            if ($success) {
                return redirect()->route('shops.customers.show', [$shop->id, $id])->with('success', 'customer_updated');
            }

            return redirect()->back()->with('error', 'Erreur lors de la mise à jour du client dans PrestaShop. Vérifiez les logs pour plus de détails.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Exception lors de la mise à jour: ' . $e->getMessage());
        }
    }

    public function customerDestroy(Shop $shop, int $id)
    {
        $success = $this->service->deleteCustomer($shop->url, $shop->api_key, $id);

        if ($success) {
            return redirect()->route('shops.customers', $shop->id)->with('success', 'Client supprimé avec succès.');
        }

        return redirect()->back()->with('error', 'Erreur lors de la suppression du client dans PrestaShop.');
    }

    public function addressDestroy(Shop $shop, int $id)
    {
        $success = $this->service->deleteAddress($shop->url, $shop->api_key, $id);

        if ($success) {
            return redirect()->back()->with('success', 'Adresse supprimée avec succès.');
        }

        return redirect()->back()->with('error', 'Erreur lors de la suppression de l\'adresse dans PrestaShop.');
    }

    public function addressEdit(Shop $shop, int $id)
    {
        $address = $this->service->getAddress($shop->url, $shop->api_key, $id);
        $countries = $this->service->getCountries($shop->url, $shop->api_key);

        return Inertia::render('Shops/AddressEdit', [
            'shop' => $shop,
            'address' => $address,
            'countries' => $countries
        ]);
    }

    public function addressUpdate(Request $request, Shop $shop, int $id)
    {

        $validated = $request->validate([
            'firstname' => 'required|string',
            'lastname' => 'required|string',
            'address1' => 'required|string',
            'address2' => 'nullable|string',
            'postcode' => 'required|string',
            'city' => 'required|string',
            'id_country' => 'required|integer',
            'phone' => 'nullable|string',
            'phone_mobile' => 'nullable|string',
            'alias' => 'required|string',
            'company' => 'nullable|string',
            'dni' => 'nullable|string',
            'vat_number' => 'nullable|string',
        ]);

        try {
            $result = $this->service->updateAddress($shop->url, $shop->api_key, $id, $validated);

            if ($result['success']) {
                return redirect()->route('shops.customers', [$shop->id, 'tab' => 'addresses'])->with('success', 'address_updated');
            }

            \Log::error("Address Update Failed in Service for ID: $id");
            return redirect()->back()->with('error', $result['message'] ?? 'Erreur lors de la mise à jour de l\'adresse.');
        } catch (\Throwable $e) {
            \Log::error("Address Update Controller Exception: " . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

}
