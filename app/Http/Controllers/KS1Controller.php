<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Services\PrestaShopService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Response;
use DOMDocument;
use Exception;

class KS1Controller extends Controller
{
    protected $prestaShopService;

    public function __construct(PrestaShopService $prestaShopService)
    {
        $this->prestaShopService = $prestaShopService;
    }

    /**
     * Get orders for a specific shop.
     * Replicates ps_ks1 module's get_orders.php logic.
     */
    public function getOrders(Shop $shop, Request $request)
    {
        if (!$shop->ks1_enabled) {
            return response('KS1 not enabled for this shop.', 403);
        }

        // Get KS1 settings
        $settings = $shop->ks1_settings ?? [];
        $orderStates = $settings['order_states'] ?? [2]; // Default to Processing (2)

        try {
            // We fetch the basic orders with the filtered states
            // API Format usually displayed as JSON by PrestaShopService, 
            // but for KS1 we will transform it back or use separate logic.

            $filters = [
                'current_state' => '[' . implode('|', (array)$orderStates) . ']'
            ];

            // Limit result like in the original module
            $results = $this->prestaShopService->getOrders($shop->url, $shop->api_key, 1, 10, $filters, 'id', 'ASC');
            $orders = $results['items'] ?? [];

            // XML Response format matching ps_ks1
            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->formatOutput = true;

            $rootNode = $doc->createElement('prestashop');
            $rootNode->setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            $doc->appendChild($rootNode);

            $ordersNode = $doc->createElement('orders');
            $rootNode->appendChild($ordersNode);

            foreach ($orders as $order) {
                $orderNode = $doc->createElement('order');
                $idNode = $doc->createElement('id', $order['id']);
                $orderNode->appendChild($idNode);
                $ordersNode->appendChild($orderNode);
            }

            return Response::make($doc->saveXML(), 200, ['Content-Type' => 'application/xml']);
        } catch (Exception $e) {
            Log::error('KS1 getOrders error: ' . $e->getMessage());
            return response($e->getMessage(), 500);
        }
    }

    /**
     * Get a specific order's XML detail.
     */
    public function getOrder(Shop $shop, Request $request)
    {
        if (!$shop->ks1_enabled) {
            return response('KS1 not enabled', 403);
        }

        $id = $request->input('id');
        if (!$id) {
            return response('Missing ID', 400);
        }

        try {
            // Ideally we'd get the raw XML from PrestaShop 
            // since KS1 expects a structure very close to it.
            $endpoint = rtrim($shop->url, '/') . '/api/orders/' . $id . '?ws_key=' . $shop->api_key;
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->get($endpoint);

            if (!$response->successful()) {
                return response('PrestaShop API error', $response->status());
            }

            // We load the XML to potentially manipulate it as the module did
            $doc = new DOMDocument();
            $doc->loadXML($response->body());
            
            // The original module forced some shipping tags (GK-QL-DHL)
            $orderNodes = $doc->getElementsByTagName('order');
            if ($orderNodes->length > 0) {
                $orderNode = $orderNodes->item(0);
                
                // Ensure ShippingAgentCode exists
                $sacNodes = $orderNode->getElementsByTagName('ShippingAgentCode');
                if ($sacNodes->length === 0) {
                    $orderNode->appendChild($doc->createElement('ShippingAgentCode', 'GK-QL-DHL'));
                } else {
                    $sacNodes->item(0)->textContent = 'GK-QL-DHL';
                }
                
                // Ensure deliverytype exists
                $dtNodes = $orderNode->getElementsByTagName('deliverytype');
                if ($dtNodes->length === 0) {
                    $orderNode->appendChild($doc->createElement('deliverytype', 'GK-QL-DHL'));
                } else {
                    $dtNodes->item(0)->textContent = 'GK-QL-DHL';
                }
            }

            return Response::make($doc->saveXML(), 200, ['Content-Type' => 'application/xml']);
        } catch (Exception $e) {
            Log::error('KS1 getOrder error: ' . $e->getMessage());
            return response($e->getMessage(), 500);
        }
    }

    /**
     * Get customer XML detail.
     */
    public function getCustomer(Shop $shop, Request $request)
    {
        if (!$shop->ks1_enabled) return response('Forbidden', 403);
        
        $id = $request->input('id');
        $endpoint = rtrim($shop->url, '/') . '/api/customers/' . $id . '?ws_key=' . $shop->api_key;
        $response = \Illuminate\Support\Facades\Http::withoutVerifying()->get($endpoint);
        
        return Response::make($response->body(), $response->status(), ['Content-Type' => 'application/xml']);
    }

    /**
     * Get address XML detail.
     */
    public function getAddress(Shop $shop, Request $request)
    {
        if (!$shop->ks1_enabled) return response('Forbidden', 403);
        
        $id = $request->input('id');
        $endpoint = rtrim($shop->url, '/') . '/api/addresses/' . $id . '?ws_key=' . $shop->api_key;
        $response = \Illuminate\Support\Facades\Http::withoutVerifying()->get($endpoint);
        
        return Response::make($response->body(), $response->status(), ['Content-Type' => 'application/xml']);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Shop $shop, Request $request)
    {
        if (!$shop->ks1_enabled) return response('Forbidden', 403);
        
        $idOrder = $request->input('id_order');
        $newState = $request->input('new_state');
        
        if (!$idOrder || !$newState) {
            return response('Missing parameters', 400);
        }

        try {
            // Get original order XML
            $endpoint = rtrim($shop->url, '/') . '/api/orders/' . $idOrder . '?ws_key=' . $shop->api_key;
            $orderRes = \Illuminate\Support\Facades\Http::withoutVerifying()->get($endpoint);
            
            if (!$orderRes->successful()) return response('Order not found', 404);
            
            $xml = new \SimpleXMLElement($orderRes->body());
            $xml->order->current_state = $newState;
            
            // Clean read-only
            unset($xml->order->date_add);
            unset($xml->order->date_upd);
            
            $updateRes = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->withBody($xml->asXML(), 'application/xml')
                ->put($endpoint);
                
            if ($updateRes->successful()) {
                return response('Updated', 200);
            }
            
            return response($updateRes->body(), $updateRes->status());
        } catch (Exception $e) {
            return response($e->getMessage(), 500);
        }
    }
}
